from django.db import models
from django.conf import settings
import uuid


class Booking(models.Model):
    BOOKING_TYPE_CHOICES = [
        ("rent", "Rent"),
        ("purchase", "Purchase"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    months = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_booking_type_display()} - {self.property.title} by {self.user.email}"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("successful", "Successful"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    tx_ref = models.CharField(max_length=100, unique=True)
    flw_ref = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NGN")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=50, blank=True)
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=255, blank=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.tx_ref} - {self.status}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ("welcome", "Welcome"),
        ("payment", "Payment"),
        ("booking", "Booking"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="system")
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type}: {self.title} -> {self.user.email}"
