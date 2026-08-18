from django.contrib import admin
from .models import Booking, PaymentTransaction, Notification


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "user", "booking_type", "amount", "status", "created_at"]
    list_filter = ["booking_type", "status"]
    search_fields = ["property__title", "user__email"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ["id", "tx_ref", "booking", "amount", "currency", "status", "verified", "created_at"]
    list_filter = ["status", "verified", "currency"]
    search_fields = ["tx_ref", "flw_ref", "customer_email"]
    readonly_fields = ["id", "created_at"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "type", "is_read", "created_at"]
    list_filter = ["type", "is_read"]
    search_fields = ["user__email", "title"]
    readonly_fields = ["id", "created_at"]
