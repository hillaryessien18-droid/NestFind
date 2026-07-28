from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Property

User = get_user_model()


def create_user(email, role):
    return User.objects.create_user(
        email=email,
        username=email.split("@")[0],
        first_name="Test",
        last_name=role.title(),
        role=role,
        password="StrongPass123!",
    )


def property_payload(**overrides):
    payload = {
        "title": "Modern City Apartment",
        "description": "A bright apartment close to transit and cafes.",
        "property_type": "apartment",
        "status": "active",
        "price": "1500.00",
        "bedrooms": 2,
        "bathrooms": 1,
        "area_sqft": 850,
        "address": "10 Market Street",
        "city": "Lagos",
        "state": "Lagos",
        "country": "Nigeria",
        "zip_code": "100001",
        "is_furnished": True,
        "minimum_lease_months": 12,
        "max_guests": 3,
        "amenity_ids": [],
    }
    payload.update(overrides)
    return payload


class PropertyEndpointTests(APITestCase):
    def setUp(self):
        self.host = create_user("host@example.com", "host")
        self.tenant = create_user("tenant2@example.com", "tenant")

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_host_can_create_list_update_and_delete_property(self):
        self.authenticate(self.host)
        create_response = self.client.post(
            "/api/properties/",
            property_payload(),
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        property_id = create_response.data["id"]
        list_response = self.client.get(
            "/api/properties/?search=Modern&city=Lagos&ordering=-price"
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertIn("results", list_response.data)

        patch_response = self.client.patch(
            f"/api/properties/{property_id}/",
            {"price": "1700.00"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

        delete_response = self.client.delete(f"/api/properties/{property_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_tenant_cannot_create_property(self):
        self.authenticate(self.tenant)
        response = self.client.post("/api/properties/", property_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_image_upload_saved_listing_similar_and_enquiry_flows(self):
        payload = property_payload()
        payload.pop("amenity_ids")
        prop = Property.objects.create(user=self.host, **payload)

        self.authenticate(self.host)
        image = SimpleUploadedFile(
            "property.jpg",
            b"small-image-content",
            content_type="image/jpeg",
        )
        image_response = self.client.post(
            f"/api/properties/{prop.id}/images/",
            {"images": [image]},
            format="multipart",
        )
        self.assertEqual(image_response.status_code, status.HTTP_201_CREATED)

        similar_response = self.client.get(f"/api/properties/{prop.id}/similar/")
        self.assertEqual(similar_response.status_code, status.HTTP_200_OK)

        self.authenticate(self.tenant)
        saved_response = self.client.post(f"/api/saved-listings/toggle/{prop.id}/")
        self.assertEqual(saved_response.status_code, status.HTTP_200_OK)
        self.assertTrue(saved_response.data["saved"])

        enquiry_response = self.client.post(
            "/api/enquiries/",
            {"property": str(prop.id), "message": "Can I schedule a viewing?"},
            format="json",
        )
        self.assertEqual(enquiry_response.status_code, status.HTTP_201_CREATED)

        enquiries_response = self.client.get("/api/enquiries/")
        self.assertEqual(enquiries_response.status_code, status.HTTP_200_OK)
        self.assertEqual(enquiries_response.data["count"], 1)
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Property, Amenity, Review, SavedProperty, Enquiry

User = get_user_model()


class PropertyAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(
            email="host@example.com", username="host", password="testpass123", role="host"
        )
        self.guest = User.objects.create_user(
            email="guest@example.com", username="guest", password="testpass123", role="guest"
        )
        self.property = Property.objects.create(
            user=self.host,
            title="Test Property",
            description="A beautiful test property",
            property_type="apartment",
            price=1500,
            bedrooms=2,
            bathrooms=1,
            area_sqft=800,
            address="123 Test St",
            city="New York",
            state="NY",
            country="USA",
        )

    def test_list_properties(self):
        response = self.client.get("/api/properties/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_property_authenticated(self):
        self.client.force_authenticate(user=self.host)
        response = self.client.post("/api/properties/", {
            "title": "New Property",
            "description": "Great place",
            "property_type": "house",
            "price": 2000,
            "bedrooms": 3,
            "bathrooms": 2,
            "area_sqft": 1200,
            "address": "456 Main St",
            "city": "Boston",
            "state": "MA",
            "country": "USA",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_property_unauthenticated(self):
        response = self.client.post("/api/properties/", {"title": "Should Fail"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_property_detail(self):
        response = self.client.get(f"/api/properties/{self.property.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Property")

    def test_update_property_owner(self):
        self.client.force_authenticate(user=self.host)
        response = self.client.patch(f"/api/properties/{self.property.id}/", {"price": 1800})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_property_non_owner(self):
        self.client.force_authenticate(user=self.guest)
        response = self.client.patch(f"/api/properties/{self.property.id}/", {"price": 1800})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_property_owner(self):
        self.client.force_authenticate(user=self.host)
        response = self.client.delete(f"/api/properties/{self.property.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_property_non_owner(self):
        self.client.force_authenticate(user=self.guest)
        response = self.client.delete(f"/api/properties/{self.property.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_featured_properties(self):
        self.property.views_count = 100
        self.property.save()
        response = self.client.get("/api/properties/featured/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_my_properties(self):
        self.client.force_authenticate(user=self.host)
        response = self.client.get("/api/properties/my_properties/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_save_toggle(self):
        self.client.force_authenticate(user=self.guest)
        response = self.client.post(f"/api/properties/{self.property.id}/save/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(SavedProperty.objects.filter(user=self.guest, property=self.property).exists())
        response = self.client.post(f"/api/properties/{self.property.id}/save/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(SavedProperty.objects.filter(user=self.guest, property=self.property).exists())

    def test_search_properties(self):
        response = self.client.get("/api/properties/", {"search": "Test"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_city(self):
        response = self.client.get("/api/properties/", {"city": "New York"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_price(self):
        response = self.client.get("/api/properties/", {"price_min": 1000, "price_max": 2000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ordering(self):
        response = self.client.get("/api/properties/", {"ordering": "price"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ReviewAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(
            email="host@example.com", username="host", password="testpass123", role="host"
        )
        self.tenant = User.objects.create_user(
            email="tenant@example.com", username="tenant", password="testpass123", role="tenant"
        )
        self.property = Property.objects.create(
            user=self.host, title="Review Property", description="Test",
            property_type="apartment", price=1500, bedrooms=1, bathrooms=1,
            area_sqft=500, address="123 St", city="NYC", state="NY", country="USA",
        )

    def test_list_reviews(self):
        response = self.client.get(f"/api/properties/{self.property.id}/reviews/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_review(self):
        self.client.force_authenticate(user=self.tenant)
        response = self.client.post(f"/api/properties/{self.property.id}/reviews/", {
            "rating": 5, "comment": "Amazing place!"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_review_unauthenticated(self):
        response = self.client.post(f"/api/properties/{self.property.id}/reviews/", {
            "rating": 5, "comment": "No auth"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_review(self):
        self.client.force_authenticate(user=self.tenant)
        Review.objects.create(property=self.property, user=self.tenant, rating=4, comment="First")
        response = self.client.post(f"/api/properties/{self.property.id}/reviews/", {
            "rating": 5, "comment": "Second"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SavedPropertyAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(
            email="host@example.com", username="host", password="testpass123", role="host"
        )
        self.guest = User.objects.create_user(
            email="guest@example.com", username="guest", password="testpass123", role="guest"
        )
        self.property = Property.objects.create(
            user=self.host, title="Saved Property", description="Test",
            property_type="house", price=2500, bedrooms=3, bathrooms=2,
            area_sqft=1500, address="456 Ave", city="LA", state="CA", country="USA",
        )

    def test_saved_properties_list(self):
        SavedProperty.objects.create(user=self.guest, property=self.property)
        self.client.force_authenticate(user=self.guest)
        response = self.client.get("/api/properties/saved/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_saved_properties_unauthenticated(self):
        response = self.client.get("/api/properties/saved/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class EnquiryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(
            email="host@example.com", username="host", password="testpass123", role="host"
        )
        self.tenant = User.objects.create_user(
            email="tenant@example.com", username="tenant", password="testpass123", role="tenant"
        )
        self.property = Property.objects.create(
            user=self.host, title="Enquiry Property", description="Test",
            property_type="condo", price=1800, bedrooms=2, bathrooms=1,
            area_sqft=900, address="789 Blvd", city="Chicago", state="IL", country="USA",
        )

    def test_create_enquiry(self):
        self.client.force_authenticate(user=self.tenant)
        response = self.client.post("/api/enquiries/", {
            "property": str(self.property.id),
            "message": "Is this available?",
            "phone": "555-1234",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_enquiries_sender(self):
        Enquiry.objects.create(
            property=self.property, sender=self.tenant, host=self.host,
            message="Hello", phone="555-0000"
        )
        self.client.force_authenticate(user=self.tenant)
        response = self.client.get("/api/enquiries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_enquiries_host(self):
        Enquiry.objects.create(
            property=self.property, sender=self.tenant, host=self.host,
            message="Hello", phone="555-0000"
        )
        self.client.force_authenticate(user=self.host)
        response = self.client.get("/api/enquiries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AmenityAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin@example.com", username="admin", password="testpass123"
        )

    def test_list_amenities(self):
        Amenity.objects.create(name="WiFi", icon="wifi")
        response = self.client.get("/api/amenities/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_amenity_authenticated(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/amenities/", {"name": "Pool"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_amenity_unauthenticated(self):
        response = self.client.post("/api/amenities/", {"name": "Pool"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
