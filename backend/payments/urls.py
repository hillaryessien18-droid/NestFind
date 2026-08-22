from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"bookings", views.BookingViewSet, basename="booking")
router.register(r"notifications", views.NotificationViewSet, basename="notification")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "payments/initialize/",
        views.PaymentInitializeView.as_view(),
        name="payment-initialize",
    ),
    path(
        "payments/verify/<str:tx_ref>/",
        views.PaymentVerifyView.as_view(),
        name="payment-verify",
    ),
    path(
        "payments/webhook/",
        views.PaymentWebhookView.as_view(),
        name="payment-webhook",
    ),
    path(
        "payments/history/",
        views.PaymentHistoryView.as_view(),
        name="payment-history",
    ),
    path(
        "payments/receipt/<str:tx_ref>/",
        views.PaymentReceiptView.as_view(),
        name="payment-receipt",
    ),
]
