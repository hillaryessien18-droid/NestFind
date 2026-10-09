import os
import hashlib
import requests
from django.conf import settings


def _get_secret_key():
    return os.getenv("FLW_SECRET_KEY", "").strip()


def _get_base_url():
    return os.getenv("FLW_BASE_URL", "https://api.flutterwave.com/v3")


def initialize_payment(tx_ref, amount, email, name, phone=None, redirect_url=None, meta=None):
    """
    Initialize a Flutterwave payment.
    Returns the payment data including the checkout link.
    """
    secret_key = _get_secret_key()
    base_url = _get_base_url()

    if not secret_key:
        return {"status": "error", "message": "Flutterwave secret key is not configured."}

    headers = {
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }

    if not redirect_url:
        redirect_url = f"{settings.FRONTEND_URL.rstrip('/')}/payment/success"

    payload = {
        "tx_ref": tx_ref,
        "amount": str(amount),
        "currency": "NGN",
        "redirect_url": redirect_url,
        "customer": {
            "email": email,
            "name": name,
        },
        "meta": meta or {},
        "customizations": {
            "title": "NestFind Payment",
            "description": "Property payment on NestFind",
            "logo": "",
        },
    }

    if phone:
        payload["customer"]["phone_number"] = phone

    try:
        response = requests.post(
            f"{base_url}/payments",
            json=payload,
            headers=headers,
            timeout=30,
        )
        return response.json()
    except (requests.RequestException, ValueError):
        return {"status": "error", "message": "Flutterwave is temporarily unavailable."}


def verify_payment(tx_ref):
    """
    Verify a Flutterwave transaction by reference.
    Returns the verification response.
    """
    secret_key = _get_secret_key()
    base_url = _get_base_url()

    if not secret_key:
        return {"status": "error", "message": "Flutterwave secret key is not configured."}

    headers = {
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.get(
            f"{base_url}/transactions/verify_by_reference",
            params={"tx_ref": tx_ref},
            headers=headers,
            timeout=30,
        )
        return response.json()
    except (requests.RequestException, ValueError):
        return {"status": "error", "message": "Flutterwave is temporarily unavailable."}


def verify_webhook_signature(payload_body, signature_header, secret_hash=None):
    """
    Verify Flutterwave webhook signature.
    Uses the FLW_SECRET_HASH env var or falls back to FLW_ENCRYPTION_KEY.
    """
    encryption_key = os.getenv("FLW_ENCRYPTION_KEY", "")
    secret = secret_hash or os.getenv("FLW_SECRET_HASH", encryption_key)
    if not secret:
        return True

    expected_hash = hashlib.sha256(secret.encode()).hexdigest()
    return expected_hash == signature_header


def generate_tx_ref(prefix="NF"):
    """Generate a unique transaction reference."""
    import time
    import random
    timestamp = int(time.time())
    random_part = random.randint(1000, 9999)
    return f"{prefix}-{timestamp}-{random_part}"
