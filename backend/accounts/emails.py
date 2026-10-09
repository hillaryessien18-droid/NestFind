from django.conf import settings

from core.email_delivery import send_transactional_email


def send_registration_welcome_email(user):
    name = user.first_name.strip() or user.full_name or "there"
    is_host = user.role == "host"
    if is_host:
        next_step = "You can now create a listing, respond to enquiries, and manage your properties from your account."
        action_label = "Manage your listings"
        action_path = "/my-properties"
    else:
        next_step = "You can now explore available homes, save the ones you like, and contact hosts when you find the right fit."
        action_label = "Explore homes"
        action_path = "/properties"
    return send_transactional_email(
        recipient=user.email,
        recipient_name=user.full_name or user.email,
        subject="Welcome to NestFind",
        greeting=f"Hello {name},",
        paragraphs=[
            "Welcome to NestFind. Your account is ready, and we're glad you're here.",
            next_step,
            "We'll keep your enquiries, bookings, and account updates together so you can follow each step with confidence.",
        ],
        action_label=action_label,
        action_url=f"{settings.FRONTEND_URL.rstrip('/')}{action_path}",
    )


def send_password_changed_email(user):
    name = user.first_name.strip() or user.full_name or "there"
    return send_transactional_email(
        recipient=user.email,
        recipient_name=user.full_name or user.email,
        subject="Your NestFind password was changed",
        greeting=f"Hello {name},",
        paragraphs=[
            "The password for your NestFind account was changed successfully.",
            "If you made this change, no further action is needed. If you did not, contact NestFind support immediately and secure your email account.",
        ],
        action_label="Visit NestFind",
        action_url=settings.FRONTEND_URL.rstrip("/"),
    )


def send_email_verification_code(user, code):
    return send_transactional_email(
        recipient=user.email,
        recipient_name=user.full_name or user.email,
        subject="Verify your NestFind email address",
        greeting=f"Hello {user.first_name.strip() or 'there'},",
        paragraphs=[
            f"Your NestFind email verification code is {code}.",
            "Enter this code in your profile within 10 minutes. If you did not create this account, you can ignore this message.",
        ],
    )


def send_password_reset_email(user, url):
    return send_transactional_email(
        recipient=user.email,
        recipient_name=user.full_name or user.email,
        subject="Reset your NestFind password",
        greeting=f"Hello {user.first_name.strip() or 'there'},",
        paragraphs=[
            "We received a request to reset your NestFind password. This link expires in one hour.",
            "If you did not request this, you can ignore this email. Your password has not changed.",
        ],
        action_label="Reset password",
        action_url=url,
    )


def send_login_alert_email(user):
    return send_transactional_email(
        recipient=user.email,
        recipient_name=user.full_name or user.email,
        subject="New sign-in to your NestFind account",
        greeting=f"Hello {user.first_name.strip() or 'there'},",
        paragraphs=[
            "Your NestFind account was just signed in to.",
            "If this was you, no action is needed. If you do not recognize this activity, reset your password immediately.",
        ],
        action_label="Secure your account",
        action_url=f"{settings.FRONTEND_URL.rstrip('/')}/forgot-password",
    )
