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
