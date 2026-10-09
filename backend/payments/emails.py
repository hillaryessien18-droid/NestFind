from django.conf import settings

from core.email_delivery import send_transactional_email


def send_payment_confirmation_email(user, booking, transaction):
    property_obj = booking.property
    name = user.first_name.strip() or user.full_name or "there"
    is_rental = booking.booking_type == "rent"
    details = [
        ("Property", property_obj.title),
        ("Location", f"{property_obj.address}, {property_obj.city}, {property_obj.state}"),
        ("Payment for", "Rental" if is_rental else "Purchase"),
        ("Amount paid", f"NGN {booking.amount:,.2f}"),
        ("Transaction reference", transaction.tx_ref),
    ]
    if is_rental:
        details.extend([
            ("Lease duration", f"{booking.months} month(s)"),
            ("Move-in date", booking.start_date.strftime("%d %B %Y")),
        ])
    next_step = (
        "Please complete your move-in details in My Bookings so your host can prepare for your arrival."
        if is_rental else
        "Your purchase confirmation is available in My Bookings, and your receipt is ready to view online."
    )
    paragraphs = [
        "We have verified your payment and confirmed your booking. Keep this email and your receipt for your records.",
        next_step,
    ]
    return send_transactional_email(
        recipient=user.email,
        recipient_name=user.full_name or user.email,
        subject=f"Payment confirmed for {property_obj.title} | NestFind",
        greeting=f"Hello {name},",
        paragraphs=paragraphs,
        details=details,
        action_label="View your receipt",
        action_url=f"{settings.FRONTEND_URL.rstrip('/')}/receipt/{transaction.tx_ref}",
    )
