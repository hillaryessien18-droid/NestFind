from rest_framework import serializers
from .models import Booking, PaymentTransaction, Notification


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

    class Meta:
        model = Booking
        fields = [
            "id", "property", "property_title", "property_image", "property_price",
            "property_address", "user", "user_name", "user_email", "booking_type",
            "booking_type_display", "amount", "status", "status_display", "start_date",
            "end_date", "months", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "amount", "status", "created_at", "updated_at"]

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
