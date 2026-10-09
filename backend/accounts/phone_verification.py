"""Issue and verify short lived phone codes through Brevo transactional SMS."""

import logging
import secrets
from datetime import timedelta

import requests
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone


logger = logging.getLogger(__name__)
BREVO_SMS_URL = "https://api.brevo.com/v3/transactionalSMS/send"
CODE_LIFETIME = timedelta(minutes=10)
RESEND_DELAY = timedelta(seconds=60)
MAX_ATTEMPTS = 5


def send_brevo_sms(recipient, content):
    if not settings.BREVO_API_KEY:
        logger.error("Transactional SMS not sent: Brevo API key is missing")
        return False
    try:
        response = requests.post(
            BREVO_SMS_URL,
            headers={"api-key": settings.BREVO_API_KEY, "accept": "application/json", "content-type": "application/json"},
            json={
                "sender": settings.BREVO_SMS_SENDER,
                "recipient": recipient.lstrip("+"),
                "content": content,
                "type": "transactional",
            },
            timeout=5,
        )
    except requests.RequestException:
        logger.exception("Transactional SMS request failed")
        return False
    if response.status_code != 201:
        logger.error("Transactional SMS rejected (HTTP %s)", response.status_code)
        return False
    return True


def send_phone_code(user, *, welcome=False):
    if not user.phone:
        return "missing_phone"
    if user.phone_verified:
        return "already_verified"
    now = timezone.now()
    if user.phone_verification_sent_at and now - user.phone_verification_sent_at < RESEND_DELAY:
        return "rate_limited"
    code = f"{secrets.randbelow(1_000_000):06d}"
    intro = "Welcome to NestFind. " if welcome else ""
    content = f"{intro}Your phone verification code is {code}. It expires in 10 minutes. Do not share this code."
    if not send_brevo_sms(user.phone, content):
        return "unavailable"

    user.phone_verification_code = make_password(code)
    user.phone_verification_expires_at = now + CODE_LIFETIME
    user.phone_verification_sent_at = now
    user.phone_verification_attempts = 0
    user.save(update_fields=[
        "phone_verification_code", "phone_verification_expires_at",
        "phone_verification_sent_at", "phone_verification_attempts",
    ])
    return "sent"


def verify_phone_code(user, code):
    if not user.phone or not user.phone_verification_code:
        return False
    if not user.phone_verification_expires_at or timezone.now() >= user.phone_verification_expires_at:
        return False
    if user.phone_verification_attempts >= MAX_ATTEMPTS:
        return False
    if not check_password(code, user.phone_verification_code):
        user.phone_verification_attempts += 1
        user.save(update_fields=["phone_verification_attempts"])
        return False
    user.phone_verified = True
    user.phone_verification_code = ""
    user.phone_verification_expires_at = None
    user.phone_verification_sent_at = None
    user.phone_verification_attempts = 0
    user.save(update_fields=[
        "phone_verified", "phone_verification_code", "phone_verification_expires_at",
        "phone_verification_sent_at", "phone_verification_attempts",
    ])
    return True
