from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from properties.models import Property, Enquiry

User = get_user_model()


class PlatformStatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_platform_stats(self):
        response = self.client.get("/api/stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_properties", response.data)
        self.assertIn("total_users", response.data)


class HostDashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(
            email="host@example.com", username="host", password="testpass123", role="host"
        )
        self.tenant = User.objects.create_user(
            email="tenant@example.com", username="tenant", password="testpass123", role="tenant"
        )
        self.property = Property.objects.create(
            user=self.host, title="Dashboard Property", description="Test",
            property_type="apartment", price=2000, bedrooms=2, bathrooms=1,
            area_sqft=800, address="123 St", city="NYC", state="NY", country="USA",
            status="active", views_count=50,
        )

    def test_host_dashboard_unauthenticated(self):
        response = self.client.get("/api/dashboard/host/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_host_dashboard(self):
        self.client.force_authenticate(user=self.host)
        response = self.client.get("/api/dashboard/host/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("summary", response.data)
        self.assertIn("views_by_property", response.data)
        self.assertIn("recent_enquiries", response.data)

    def test_host_dashboard_non_host(self):
        self.client.force_authenticate(user=self.tenant)
        response = self.client.get("/api/dashboard/host/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
