from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import logging

from properties.models import Property
from .models import Booking, PaymentTransaction, Notification
from .serializers import (
    BookingSerializer,
    PaymentTransactionSerializer,
    NotificationSerializer,
    PaymentInitializeSerializer,
)
from .services import initialize_payment, verify_payment, generate_tx_ref

logger = logging.getLogger(__name__)


def send_welcome_email(user, booking):
    """Send welcome email after successful payment."""
    subject = f"Welcome to NestFind - {booking.get_booking_type_display()} Confirmed!"
    property_title = booking.property.title

    if booking.booking_type == "rent":
        message = (
            f"Dear {user.full_name or user.email},\n\n"
            f"Congratulations! Your rental of '{property_title}' has been confirmed.\n\n"
            f"Booking Details:\n"
            f"- Property: {property_title}\n"
            f"- Location: {booking.property.address}, {booking.property.city}, {booking.property.state}\n"
            f"- Duration: {booking.months} month(s)\n"
            f"- Amount Paid: NGN {booking.amount:,.2f}\n"
            f"- Start Date: {booking.start_date}\n"
            f"{'- End Date: ' + str(booking.end_date) if booking.end_date else ''}\n\n"
            f"Thank you for choosing NestFind! We wish you a wonderful stay.\n\n"
            f"Best regards,\nNestFind Team"
        )
    else:
        message = (
            f"Dear {user.full_name or user.email},\n\n"
            f"Congratulations! Your purchase of '{property_title}' has been confirmed.\n\n"
            f"Booking Details:\n"
            f"- Property: {property_title}\n"
            f"- Location: {booking.property.address}, {booking.property.city}, {booking.property.state}\n"
            f"- Amount Paid: NGN {booking.amount:,.2f}\n"
            f"- Purchase Date: {booking.start_date}\n\n"
            f"Thank you for choosing NestFind! We wish you a great new home.\n\n"
            f"Best regards,\nNestFind Team"
        )

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL or "noreply@nestfind.com",
            [user.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {e}")


def send_welcome_notification(user, booking):
    """Create in-app welcome notification after successful payment."""
    property_title = booking.property.title

    if booking.booking_type == "rent":
        title = f"Rental Confirmed - {property_title}"
        message = (
            f"Congratulations! Your rental of '{property_title}' has been confirmed. "
            f"Duration: {booking.months} month(s), Amount: NGN {booking.amount:,.2f}. "
            f"Start date: {booking.start_date}. Welcome to your new home!"
        )
    else:
        title = f"Purchase Confirmed - {property_title}"
        message = (
            f"Congratulations! Your purchase of '{property_title}' has been confirmed. "
            f"Amount: NGN {booking.amount:,.2f}. "
            f"Purchase date: {booking.start_date}. Welcome to your new home!"
        )

    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type="welcome",
        link=f"/properties/{booking.property.id}",
    )


def send_host_notification(host, booking, payer_name):
    """Notify the property host about the new booking."""
    property_title = booking.property.title

    if booking.booking_type == "rent":
        title = f"New Rental - {property_title}"
        message = (
            f"{payer_name} has rented your property '{property_title}' "
            f"for {booking.months} month(s). Amount: NGN {booking.amount:,.2f}. "
            f"Start date: {booking.start_date}."
        )
    else:
        title = f"Property Sold - {property_title}"
        message = (
            f"{payer_name} has purchased your property '{property_title}'. "
            f"Amount: NGN {booking.amount:,.2f}."
        )

    Notification.objects.create(
        user=host,
        title=title,
        message=message,
        type="booking",
        link=f"/properties/{booking.property.id}",
    )


def confirm_payment(booking):
    """Confirm a booking and send welcome messages."""
    booking.status = "confirmed"
    booking.save(update_fields=["status"])

    prop = booking.property
    if booking.booking_type == "rent":
        prop.status = "rented"
    else:
        prop.status = "sold"
    prop.save(update_fields=["status"])

    buyer = booking.user
    if buyer.role == "guest":
        buyer.role = "tenant"
        buyer.save(update_fields=["role"])

    send_welcome_email(buyer, booking)
    send_welcome_notification(buyer, booking)
    send_host_notification(prop.user, booking, buyer.full_name or buyer.email)


class PaymentInitializeView(generics.CreateAPIView):
    serializer_class = PaymentInitializeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        logger.warning(f"Content-Type: {request.content_type}")
        logger.warning(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prop = generics.get_object_or_404(Property, pk=serializer.validated_data["property_id"])

        if prop.status not in ("active",):
            return Response(
                {"error": "This property is not available for payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking_type = serializer.validated_data["booking_type"]
        months = serializer.validated_data.get("months")
        start_date = serializer.validated_data.get("start_date", timezone.now().date())

        if booking_type == "rent":
            if not months:
                months = prop.minimum_lease_months
            end_date = start_date + timedelta(days=months * 30)
            amount = prop.price * months
        else:
            months = None
            end_date = None
            amount = prop.price

        booking = Booking.objects.create(
            property=prop,
            user=request.user,
            booking_type=booking_type,
            amount=amount,
            start_date=start_date,
            end_date=end_date,
            months=months,
            status="pending",
        )

        tx_ref = generate_tx_ref()
        full_name = serializer.validated_data.get("full_name", "") or request.user.full_name or request.user.email
        email = request.user.email
        phone = serializer.validated_data.get("phone", "") or request.user.phone

        payment_data = initialize_payment(
            tx_ref=tx_ref,
            amount=amount,
            email=email,
            name=full_name,
            phone=phone or None,
            meta={"booking_id": str(booking.id)},
        )

        logger.info(f"Flutterwave response: {payment_data}")

        if payment_data.get("status") == "success":
            transaction = PaymentTransaction.objects.create(
                booking=booking,
                tx_ref=tx_ref,
                amount=amount,
                customer_email=email,
                customer_name=full_name,
                status="pending",
            )

            checkout_url = payment_data.get("data", {}).get("link")
            return Response({
                "booking_id": str(booking.id),
                "tx_ref": tx_ref,
                "checkout_url": checkout_url,
                "amount": str(amount),
                "message": "Payment initialized. Redirect to complete payment.",
            })
        else:
            booking.delete()
            flw_message = payment_data.get("message", "Unknown error")
            flw_code = payment_data.get("code", "")
            return Response(
                {
                    "error": f"Payment initialization failed: {flw_message}",
                    "details": flw_message,
                    "code": flw_code,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class PaymentVerifyView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tx_ref):
        transaction = generics.get_object_or_404(PaymentTransaction, tx_ref=tx_ref)

        if transaction.verified and transaction.status == "successful":
            return Response({
                "status": "successful",
                "message": "Payment already verified.",
                "booking_id": str(transaction.booking.id),
            })

        verification = verify_payment(tx_ref)

        if verification.get("status") == "success":
            data = verification.get("data", {})
            flw_status = data.get("status", "").lower()

            if flw_status == "successful":
                transaction.status = "successful"
                transaction.flw_ref = data.get("flw_ref", "")
                transaction.payment_method = data.get("payment_type", "")
                transaction.verified = True
                transaction.save(update_fields=["status", "flw_ref", "payment_method", "verified"])

                confirm_payment(transaction.booking)

                return Response({
                    "status": "successful",
                    "message": "Payment verified successfully.",
                    "booking_id": str(transaction.booking.id),
                })
            else:
                transaction.status = "failed"
                transaction.save(update_fields=["status"])
                return Response({
                    "status": "failed",
                    "message": "Payment was not successful.",
                })
        else:
            return Response(
                {"error": "Could not verify payment.", "details": verification.get("message", "")},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PaymentWebhookView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.data
        event = payload.get("event", "")
        data = payload.get("data", {})

        if event == "charge.completed":
            flw_status = data.get("status", "").lower()
            tx_ref = data.get("tx_ref", "")

            if flw_status == "successful" and tx_ref:
                try:
                    transaction = PaymentTransaction.objects.get(tx_ref=tx_ref)
                    if not transaction.verified:
                        transaction.status = "successful"
                        transaction.flw_ref = data.get("flw_ref", "")
                        transaction.payment_method = data.get("payment_type", "")
                        transaction.verified = True
                        transaction.save(update_fields=["status", "flw_ref", "payment_method", "verified"])
                        confirm_payment(transaction.booking)
                except PaymentTransaction.DoesNotExist:
                    logger.warning(f"Webhook received for unknown tx_ref: {tx_ref}")

        return Response({"status": "ok"})


class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            "property", "property__user"
        )


class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentTransaction.objects.filter(
            booking__user=self.request.user
        ).select_related("booking", "booking__property")


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"message": "Notification marked as read."})

    @action(detail=False, methods=["post"], url_path="read-all")
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."})

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})
