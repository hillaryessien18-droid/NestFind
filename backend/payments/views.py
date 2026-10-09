from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal, InvalidOperation
import logging

from properties.models import Property
from .models import Booking, PaymentTransaction, Notification
from .serializers import (
    BookingSerializer,
    PaymentTransactionSerializer,
    NotificationSerializer,
    PaymentInitializeSerializer,
    ReceiptSerializer,
    TenantDetailSerializer,
)
from .services import initialize_payment, verify_payment, generate_tx_ref
from .emails import send_payment_confirmation_email
from accounts.phone_verification import send_brevo_sms

logger = logging.getLogger(__name__)


def payment_details_match(data, transaction):
    """Only confirm a charge that matches the stored transaction."""
    try:
        paid_amount = Decimal(str(data.get("amount")))
    except (InvalidOperation, TypeError):
        return False
    return (
        str(data.get("status", "")).lower() == "successful"
        and data.get("tx_ref") == transaction.tx_ref
        and data.get("currency") == transaction.currency
        and paid_amount >= transaction.amount
    )


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


def confirm_payment(booking, transaction):
    """Confirm a booking and send welcome messages."""
    if booking.status == "confirmed":
        return
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

    send_payment_confirmation_email(buyer, booking, transaction)
    if buyer.phone and buyer.phone_verified:
        send_brevo_sms(
            buyer.phone,
            f"NestFind payment confirmed: NGN {booking.amount:,.2f}. Reference: {transaction.tx_ref}.",
        )
    send_welcome_notification(buyer, booking)
    send_host_notification(prop.user, booking, buyer.full_name or buyer.email)


class PaymentInitializeView(generics.CreateAPIView):
    serializer_class = PaymentInitializeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prop = generics.get_object_or_404(Property, pk=serializer.validated_data["property_id"])

        if prop.status not in ("active",):
            return Response(
                {"error": "This property is not available for payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking_type = serializer.validated_data["booking_type"]
        months = serializer.validated_data.get("months")
        start_date = serializer.validated_data.get("start_date") if booking_type == "rent" else None

        if booking_type == "rent":
            if not months:
                months = prop.minimum_lease_months
            if months < prop.minimum_lease_months:
                return Response(
                    {"months": [f"Minimum lease is {prop.minimum_lease_months} months."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            start_date = start_date or timezone.localdate()
            end_date = start_date + timedelta(days=months * 30)
            amount = prop.price * months
        else:
            start_date = timezone.localdate()
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

        checkout_url = payment_data.get("data", {}).get("link") if isinstance(payment_data.get("data"), dict) else None
        if payment_data.get("status") == "success" and checkout_url:
            transaction = PaymentTransaction.objects.create(
                booking=booking,
                tx_ref=tx_ref,
                amount=amount,
                customer_email=email,
                customer_name=full_name,
                status="pending",
            )

            return Response({
                "booking_id": str(booking.id),
                "tx_ref": tx_ref,
                "checkout_url": checkout_url,
                "amount": str(amount),
                "message": "Payment initialized. Redirect to complete payment.",
            })
        else:
            booking.delete()
            logger.error("Flutterwave payment initialization failed: %s", payment_data.get("message", "Unknown error"))
            return Response(
                {"error": "Payments are temporarily unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class PaymentVerifyView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tx_ref):
        transaction = generics.get_object_or_404(
            PaymentTransaction, tx_ref=tx_ref, booking__user=request.user
        )

        if transaction.verified and transaction.status == "successful":
            return Response({
                "status": "successful",
                "message": "Payment already verified.",
                "booking_id": str(transaction.booking.id),
                "booking_type": transaction.booking.booking_type,
            })

        verification = verify_payment(tx_ref)

        if verification.get("status") == "success":
            data = verification.get("data", {})
            flw_status = str(data.get("status", "")).lower()

            if flw_status == "successful" and payment_details_match(data, transaction):
                transaction.status = "successful"
                transaction.flw_ref = data.get("flw_ref", "")
                transaction.payment_method = data.get("payment_type", "")
                transaction.verified = True
                transaction.save(update_fields=["status", "flw_ref", "payment_method", "verified"])

                confirm_payment(transaction.booking, transaction)

                return Response({
                    "status": "successful",
                    "message": "Payment verified successfully.",
                    "booking_id": str(transaction.booking.id),
                    "booking_type": transaction.booking.booking_type,
                })
            elif flw_status == "successful":
                logger.error("Flutterwave verification details did not match transaction %s", tx_ref)
                return Response(
                    {"error": "Could not confirm this payment. Please contact support."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                if flw_status == "failed":
                    transaction.status = "failed"
                    transaction.save(update_fields=["status"])
                return Response({
                    "status": "failed" if flw_status == "failed" else "pending",
                    "message": "Payment was not successful." if flw_status == "failed" else "Payment is still pending.",
                    "booking_id": str(transaction.booking.id),
                    "booking_type": transaction.booking.booking_type,
                })
        else:
            return Response(
                {"error": "Could not verify your payment right now. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class PaymentWebhookView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.data
        event = payload.get("event", "")
        data = payload.get("data", {})

        if event == "charge.completed":
            flw_status = str(data.get("status", "")).lower()
            tx_ref = data.get("tx_ref", "")

            if flw_status == "successful" and tx_ref:
                try:
                    transaction = PaymentTransaction.objects.get(tx_ref=tx_ref)
                    if not transaction.verified:
                        verification = verify_payment(tx_ref)
                        verified_data = verification.get("data", {})
                        if verification.get("status") == "success" and payment_details_match(verified_data, transaction):
                            transaction.status = "successful"
                            transaction.flw_ref = verified_data.get("flw_ref", "")
                            transaction.payment_method = verified_data.get("payment_type", "")
                            transaction.verified = True
                            transaction.save(update_fields=["status", "flw_ref", "payment_method", "verified"])
                            confirm_payment(transaction.booking, transaction)
                        else:
                            logger.warning("Webhook charge could not be verified for %s", tx_ref)
                except PaymentTransaction.DoesNotExist:
                    logger.warning(f"Webhook received for unknown tx_ref: {tx_ref}")

        return Response({"status": "ok"})


class PaymentReceiptView(generics.RetrieveAPIView):
    """Return the full payment receipt for a verified transaction."""
    serializer_class = ReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "tx_ref"
    lookup_url_kwarg = "tx_ref"

    def get_object(self):
        tx = generics.get_object_or_404(
            PaymentTransaction,
            tx_ref=self.kwargs["tx_ref"],
            booking__user=self.request.user,
        )
        return {"transaction": tx, "booking": tx.booking}


class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            "property", "property__user"
        )

    @action(detail=True, methods=["get", "post"], url_path="tenant-details")
    def tenant_details(self, request, pk=None):
        booking = self.get_object()

        if request.method == "GET":
            details = getattr(booking, "tenant_details", None)
            if not details:
                return Response({"detail": "No tenant details submitted yet."}, status=status.HTTP_404_NOT_FOUND)
            return Response(TenantDetailSerializer(details).data)

        existing = getattr(booking, "tenant_details", None)
        serializer = TenantDetailSerializer(
            existing,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(booking=booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED if not existing else status.HTTP_200_OK)


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
