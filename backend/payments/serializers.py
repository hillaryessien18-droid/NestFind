from rest_framework import serializers
from .models import Booking, PaymentTransaction, TenantDetail, Notification


class BookingSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_image = serializers.SerializerMethodField()
    property_price = serializers.DecimalField(
        source="property.price", max_digits=12, decimal_places=2, read_only=True
    )
    property_address = serializers.SerializerMethodField()
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    booking_type_display = serializers.CharField(source="get_booking_type_display", read_only=True)
    receipt_tx_ref = serializers.SerializerMethodField()
    has_tenant_details = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "property", "property_title", "property_image", "property_price",
            "property_address", "user", "user_name", "user_email", "booking_type",
            "booking_type_display", "amount", "status", "status_display", "start_date",
            "end_date", "months", "receipt_tx_ref", "has_tenant_details",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "amount", "status", "created_at", "updated_at"]

    def get_receipt_tx_ref(self, obj):
        tx = obj.transactions.filter(status="successful").order_by("-created_at").first()
        return tx.tx_ref if tx else None

    def get_has_tenant_details(self, obj):
        return hasattr(obj, "tenant_details")

    def get_property_image(self, obj):
        request = self.context.get("request")
        img = obj.property.images.filter(is_primary=True).first()
        if not img:
            img = obj.property.images.first()
        if img and request:
            return request.build_absolute_uri(img.image.url)
        return None

    def get_property_address(self, obj):
        p = obj.property
        return f"{p.address}, {p.city}, {p.state}"


class BookingCreateSerializer(serializers.Serializer):
    property_id = serializers.UUIDField()
    booking_type = serializers.ChoiceField(choices=Booking.BOOKING_TYPE_CHOICES)
    months = serializers.IntegerField(min_value=1, max_value=60, required=False)
    start_date = serializers.DateField(required=False)


class PaymentTransactionSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source="booking.id", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            "id", "booking_id", "tx_ref", "flw_ref", "amount", "currency",
            "status", "status_display", "payment_method", "customer_email",
            "customer_name", "verified", "created_at",
        ]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "title", "message", "type", "type_display",
            "is_read", "link", "created_at",
        ]
        read_only_fields = ["id", "title", "message", "type", "link", "created_at"]


class PaymentInitializeSerializer(serializers.Serializer):
    property_id = serializers.UUIDField()
    booking_type = serializers.ChoiceField(choices=Booking.BOOKING_TYPE_CHOICES)
    months = serializers.IntegerField(min_value=1, max_value=60, required=False)
    start_date = serializers.DateField(required=False)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)


class TenantDetailSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source="booking.id", read_only=True)

    class Meta:
        model = TenantDetail
        fields = [
            "id", "booking", "booking_id", "phone", "current_address",
            "occupation", "next_of_kin_name", "next_of_kin_phone",
            "id_number", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "booking", "created_at", "updated_at"]

    def validate_booking(self, booking):
        user = self.context["request"].user
        if booking.user != user:
            raise serializers.ValidationError("You can only submit details for your own bookings.")
        if booking.status != "confirmed":
            raise serializers.ValidationError("Payment for this booking has not been confirmed yet.")
        return booking


class ReceiptSerializer(serializers.Serializer):
    """Full rent payment receipt built from the verified transaction."""

    receipt_number = serializers.SerializerMethodField()
    issued_at = serializers.DateTimeField(source="transaction.created_at", read_only=True)
    status = serializers.CharField(source="transaction.get_status_display", read_only=True)
    payment_method = serializers.CharField(source="transaction.payment_method", read_only=True)
    flw_ref = serializers.CharField(source="transaction.flw_ref", read_only=True)
    tx_ref = serializers.CharField(source="transaction.tx_ref", read_only=True)
    currency = serializers.CharField(source="transaction.currency", read_only=True)
    amount = serializers.DecimalField(source="transaction.amount", max_digits=12, decimal_places=2, read_only=True)

    payer_name = serializers.CharField(source="transaction.customer_name", read_only=True)
    payer_email = serializers.CharField(source="transaction.customer_email", read_only=True)

    booking_id = serializers.UUIDField(source="booking.id", read_only=True)
    booking_type = serializers.CharField(source="booking.get_booking_type_display", read_only=True)
    period_start = serializers.DateField(source="booking.start_date", read_only=True)
    period_end = serializers.DateField(source="booking.end_date", read_only=True)
    months = serializers.IntegerField(source="booking.months", read_only=True)
    paid_at = serializers.DateTimeField(source="booking.updated_at", read_only=True)

    property_title = serializers.CharField(source="booking.property.title", read_only=True)
    property_address = serializers.SerializerMethodField()
    host_name = serializers.SerializerMethodField()

    def get_receipt_number(self, ctx):
        tx_ref = ctx["transaction"].tx_ref
        return tx_ref if tx_ref.upper().startswith("NF-") else f"NF-{tx_ref}"

    def get_property_address(self, ctx):
        p = ctx["booking"].property
        return f"{p.address}, {p.city}, {p.state}"

    def get_host_name(self, ctx):
        host = ctx["booking"].property.user
        return host.full_name or host.email
