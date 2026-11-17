"""AI-written wording for welcome and payment messages.

The AI only writes the friendly wording (an email intro and a short in-app
notification). Facts such as amounts, references, dates and links always come
from the database and are added by the caller, never by the model. If AI is
disabled, misconfigured, slow, or returns anything unsafe, the fixed fallback
text is used so registration and payment flows never break.
"""

import json
import logging
import re

import requests
from django.conf import settings


logger = logging.getLogger(__name__)
ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

SYSTEM_PROMPT = (
    "You write short, warm, professional messages for NestFind, a Nigerian real estate "
    "platform for finding, renting and buying homes. Write in clear British English. "
    "Never mention amounts, prices, currencies, dates, transaction references, codes, "
    "phone numbers, email addresses or links; those are shown separately. Do not use any "
    "digits. Do not invent facts, promises, discounts or policies. No emojis, no markdown. "
    "Reply with only a JSON object with two string keys: "
    '"email_intro" (two or three sentences, at most 450 characters) and '
    '"notification" (one or two sentences, at most 200 characters).'
)

_BLOCKED = re.compile(r"\d|https?://|www\.|@|₦|\bNGN\b|naira|[*#`]", re.IGNORECASE)
_LIMITS = {"email_intro": 450, "notification": 200}


def ai_messages_enabled():
    return bool(getattr(settings, "AI_MESSAGES_ENABLED", False)
                and getattr(settings, "ANTHROPIC_API_KEY", ""))


def _clean(value, limit, allowed=()):
    if not isinstance(value, str):
        return None
    text = " ".join(value.split())
    if not text or len(text) > limit:
        return None
    # Names like "3 Bedroom Flat" may contain digits; ignore the context values we supplied.
    checked = text
    for item in allowed:
        if item:
            checked = checked.replace(item, "")
    if _BLOCKED.search(checked):
        return None
    return text


def _parse(raw):
    raw = raw.strip()
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        data = json.loads(raw[start:end + 1])
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def generate_messages(purpose, context, fallback):
    """Return {"email_intro": str, "notification": str}.

    ``purpose`` describes the occasion, ``context`` holds safe, non-numeric facts
    (first name, role, property title, city...), ``fallback`` holds the fixed text
    used for any key the AI cannot supply safely.
    """
    result = dict(fallback)
    if not ai_messages_enabled():
        return result

    prompt = (
        f"Occasion: {purpose}\n"
        f"Details you may use: {json.dumps(context, ensure_ascii=False)}\n"
        "Write the JSON now."
    )
    try:
        response = requests.post(
            ANTHROPIC_MESSAGES_URL,
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": ANTHROPIC_VERSION,
                "content-type": "application/json",
            },
            json={
                "model": settings.AI_MESSAGES_MODEL,
                "max_tokens": 400,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=settings.AI_MESSAGES_TIMEOUT,
        )
        response.raise_for_status()
        blocks = response.json().get("content", [])
        raw = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
    except (requests.RequestException, ValueError, AttributeError):
        logger.warning("AI message generation failed for %s; using fallback text", purpose, exc_info=True)
        return result

    data = _parse(raw)
    if not data:
        logger.warning("AI message for %s was not valid JSON; using fallback text", purpose)
        return result
    for key, limit in _LIMITS.items():
        allowed = [v for v in context.values() if isinstance(v, str)]
        cleaned = _clean(data.get(key), limit, allowed)
        if cleaned:
            result[key] = cleaned
        else:
            logger.info("AI %s for %s rejected by safety checks; using fallback", key, purpose)
    return result


# ---- Occasion helpers -------------------------------------------------------

def _first_name(user):
    return (user.first_name or "").strip() or None


def welcome_messages(user):
    is_host = user.role == "host"
    fallback = {
        "email_intro": "Welcome to NestFind. Your account has been created successfully.",
        "notification": (
            "Your account is ready. Complete your email and phone verification, then create your first listing from your dashboard."
            if is_host else
            "Your account is ready. Complete your email and phone verification, then explore available homes and save your favourites."
        ),
    }
    purpose = (
        "Welcome a new host who just registered to list properties. Encourage them to verify "
        "their email and phone and create their first listing."
        if is_host else
        "Welcome a new member who just registered to find a home. Encourage them to verify "
        "their email and phone, explore homes and save favourites."
    )
    return generate_messages(purpose, {"first_name": _first_name(user), "role": user.role}, fallback)


def payment_messages(user, booking):
    prop = booking.property
    is_rental = booking.booking_type == "rent"
    fallback = {
        "email_intro": "Your payment has been verified and your booking is confirmed. Thank you for choosing NestFind.",
        "notification": "",
    }
    purpose = (
        "Confirm to a customer that their rental payment was verified and their booking is "
        "confirmed. Congratulate them on their new home and remind them to complete move-in details in My Bookings."
        if is_rental else
        "Confirm to a customer that their property purchase payment was verified and the "
        "purchase is confirmed. Congratulate them and mention their receipt is in My Bookings."
    )
    context = {"first_name": _first_name(user), "property": prop.title, "city": prop.city, "state": prop.state}
    return generate_messages(purpose, context, fallback)


def host_booking_messages(host, booking):
    prop = booking.property
    is_rental = booking.booking_type == "rent"
    fallback = {
        "email_intro": (
            f"A {'rental booking' if is_rental else 'purchase'} for your property has been confirmed following a verified payment."
        ),
        "notification": "",
    }
    purpose = (
        f"Tell a host that a {'rental booking' if is_rental else 'purchase'} of their property "
        "was confirmed after a verified payment, and ask them to coordinate next steps with the customer."
    )
    context = {"first_name": _first_name(host), "property": prop.title, "city": prop.city}
    return generate_messages(purpose, context, fallback)
