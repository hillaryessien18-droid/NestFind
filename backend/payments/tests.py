from datetime import timedelta
from decimal import Decimal
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from properties.models import Property
from .models import Booking, PaymentTransaction
from .services import initialize_payment


User = get_user_model()


class PaymentFlowTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", username="host", password="testpass123", role="host"
        )
        self.guest = User.objects.create_user(
            email="new@example.com", username="new", password="testpass123", role="guest"
        )
        self.tenant = User.objects.create_user(
            email="existing@example.com", username="existing", password="testpass123", role="tenant"
        )
        self.property = Property.objects.create(
            user=self.host, title="Payment Test Home", description="Test listing",
            property_type="house", status="active", price=Decimal("1200000.00"),
            bedrooms=3, bathrooms=2, area_sqft=1400, address="12 Test Street",
            city="Uyo", state="Akwa Ibom", country="Nigeria",
            minimum_lease_months=3,
        )

    @patch("payments.views.initialize_payment")
    def test_new_and_existing_users_can_initialize_purchase_without_move_in_date(self, provider):
        provider.return_value = {
            "status": "success", "data": {"link": "https://checkout.flutterwave.com/test"}
        }
        for user in (self.guest, self.tenant):
            with self.subTest(role=user.role):
                self.client.force_authenticate(user=user)
                response = self.client.post("/api/payments/initialize/", {
                    "property_id": str(self.property.id),
                    "booking_type": "purchase",
                    "start_date": (timezone.localdate() + timedelta(days=30)).isoformat(),
                }, format="json")
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response.data["checkout_url"], "https://checkout.flutterwave.com/test")
                booking = Booking.objects.get(id=response.data["booking_id"])
                self.assertEqual(booking.start_date, timezone.localdate())
                self.assertIsNone(booking.months)
                self.assertIsNone(booking.end_date)

    @patch("payments.views.initialize_payment")
    def test_provider_authentication_error_is_not_exposed(self, provider):
        provider.return_value = {
            "status": "error", "message": "Invalid authorization key", "code": "AUTH_FAILED"
        }
        self.client.force_authenticate(user=self.guest)
        response = self.client.post("/api/payments/initialize/", {
            "property_id": str(self.property.id), "booking_type": "purchase"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertNotIn("authorization", str(response.data).lower())
        self.assertNotIn("code", response.data)
        self.assertFalse(Booking.objects.exists())

    def test_rent_respects_minimum_lease(self):
        self.client.force_authenticate(user=self.tenant)
        response = self.client.post("/api/payments/initialize/", {
            "property_id": str(self.property.id), "booking_type": "rent", "months": 1
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Booking.objects.exists())

    @patch("payments.views.verify_payment")
    @patch("payments.views.send_welcome_email")
    @patch("payments.views.initialize_payment")
    def test_new_user_payment_is_verified_and_confirmed(self, initialize, _email, verify):
        initialize.return_value = {
            "status": "success", "data": {"link": "https://checkout.flutterwave.com/test"}
        }
        self.client.force_authenticate(user=self.guest)
        created = self.client.post("/api/payments/initialize/", {
            "property_id": str(self.property.id), "booking_type": "purchase"
        }, format="json")
        tx_ref = created.data["tx_ref"]
        verify.return_value = {"status": "success", "data": {
            "status": "successful", "tx_ref": tx_ref, "currency": "NGN",
            "amount": 1200000, "flw_ref": "FLW-123", "payment_type": "card",
        }}

        response = self.client.get(f"/api/payments/verify/{tx_ref}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "successful")
        self.assertEqual(response.data["booking_type"], "purchase")
        self.assertTrue(PaymentTransaction.objects.get(tx_ref=tx_ref).verified)
        self.assertEqual(Booking.objects.get(id=created.data["booking_id"]).status, "confirmed")
        self.guest.refresh_from_db()
        self.assertEqual(self.guest.role, "tenant")

    @patch("payments.views.verify_payment")
    @patch("payments.views.initialize_payment")
    def test_verification_rejects_mismatched_amount_and_other_user(self, initialize, verify):
        initialize.return_value = {
            "status": "success", "data": {"link": "https://checkout.flutterwave.com/test"}
        }
        self.client.force_authenticate(user=self.guest)
        created = self.client.post("/api/payments/initialize/", {
            "property_id": str(self.property.id), "booking_type": "purchase"
        }, format="json")
        tx_ref = created.data["tx_ref"]
        self.client.force_authenticate(user=self.tenant)
        self.assertEqual(
            self.client.get(f"/api/payments/verify/{tx_ref}/").status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.client.force_authenticate(user=self.guest)
        verify.return_value = {"status": "success", "data": {
            "status": "successful", "tx_ref": tx_ref, "currency": "NGN", "amount": 1,
        }}
        response = self.client.get(f"/api/payments/verify/{tx_ref}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Booking.objects.get(id=created.data["booking_id"]).status, "pending")


class FlutterwaveClientTests(SimpleTestCase):
    @patch("payments.services.requests.post")
    @patch.dict("os.environ", {"FLW_SECRET_KEY": "configured-server-key"})
    def test_payment_uses_server_environment_key(self, post):
        post.return_value = Mock(json=lambda: {
            "status": "success", "data": {"link": "https://checkout.flutterwave.com/test"}
        })
        initialize_payment("NF-123", Decimal("1200.00"), "buyer@example.com", "Buyer")
        self.assertEqual(post.call_args.kwargs["headers"]["Authorization"], "Bearer configured-server-key")
