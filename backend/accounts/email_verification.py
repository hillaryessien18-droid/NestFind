"""Persisted, expiring email codes that work across web workers."""

import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from .emails import send_email_verification_code


CODE_LIFETIME = timedelta(minutes=10)
RESEND_DELAY = timedelta(seconds=60)
MAX_ATTEMPTS = 5


def send_email_code(user):
    if user.email_verified:
        return "already_verified"
    now = timezone.now()
    if user.email_verification_sent_at and now - user.email_verification_sent_at < RESEND_DELAY:
        return "rate_limited"
    code = f"{secrets.randbelow(1_000_000):06d}"
    if not send_email_verification_code(user, code):
        return "unavailable"
    user.email_verification_code = make_password(code)
    user.email_verification_expires_at = now + CODE_LIFETIME
    user.email_verification_sent_at = now
    user.email_verification_attempts = 0
    user.save(update_fields=[
        "email_verification_code", "email_verification_expires_at",
        "email_verification_sent_at", "email_verification_attempts",
    ])
    return "sent"


def verify_email_code(user, code):
    if not user.email_verification_code or not user.email_verification_expires_at:
        return False
    if timezone.now() >= user.email_verification_expires_at:
        return False
    if user.email_verification_attempts >= MAX_ATTEMPTS:
        return False
    if not check_password(code, user.email_verification_code):
        user.email_verification_attempts += 1
        user.save(update_fields=["email_verification_attempts"])
        return False
    user.email_verified = True
    user.email_verification_code = ""
    user.email_verification_expires_at = None
    user.email_verification_sent_at = None
    user.email_verification_attempts = 0
    user.save(update_fields=[
        "email_verified", "email_verification_code", "email_verification_expires_at",
        "email_verification_sent_at", "email_verification_attempts",
    ])
    return True
