"""Send transactional messages without tying account or payment flows to a mail server."""

import logging
from email.utils import formataddr

import requests
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


logger = logging.getLogger(__name__)
BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


def send_transactional_email(*, recipient, recipient_name, subject, greeting, paragraphs,
                             details=(), action_label=None, action_url=None):
    """Send a branded email and log delivery errors without breaking the user flow."""
    details = list(details)
    text_lines = [greeting, "", *paragraphs]
    if details:
        text_lines.extend(["", "Details"])
        text_lines.extend(f"{label}: {value}" for label, value in details)
    if action_label and action_url:
        text_lines.extend(["", f"{action_label}: {action_url}"])
    text_lines.extend(["", "Thank you,", "The NestFind team"])
    text_content = "\n".join(text_lines)
    html_content = render_to_string("emails/transactional.html", {
        "greeting": greeting,
        "paragraphs": paragraphs,
        "details": details,
        "action_label": action_label,
        "action_url": action_url,
        "subject": subject,
    })

    provider = settings.EMAIL_DELIVERY_PROVIDER
    if provider == "brevo":
        if not settings.BREVO_API_KEY or not settings.DEFAULT_FROM_EMAIL:
            logger.error("Transactional email not sent: Brevo API key or sender is missing")
            return False
        try:
            response = requests.post(
                BREVO_SEND_URL,
                headers={
                    "api-key": settings.BREVO_API_KEY,
                    "accept": "application/json",
                    "content-type": "application/json",
                },
                json={
                    "sender": {"email": settings.DEFAULT_FROM_EMAIL, "name": settings.DEFAULT_FROM_NAME},
                    "to": [{"email": recipient, "name": recipient_name or recipient}],
                    "subject": subject,
                    "htmlContent": html_content,
                },
                timeout=5,
            )
        except requests.RequestException:
            logger.exception("Transactional email request failed")
            return False
        if response.status_code != 201:
            logger.error("Transactional email provider rejected message (HTTP %s)", response.status_code)
            return False
        return True

    if provider == "django":
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=formataddr((settings.DEFAULT_FROM_NAME, settings.DEFAULT_FROM_EMAIL)),
            to=[recipient],
        )
        message.attach_alternative(html_content, "text/html")
        try:
            return message.send(fail_silently=False) == 1
        except Exception:
            logger.exception("Transactional email could not be sent")
            return False

    logger.error("Transactional email not sent: unknown provider %s", provider)
    return False
