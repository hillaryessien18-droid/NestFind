from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationEndpointTests(APITestCase):
    def test_register_login_refresh_and_me_aliases(self):
        register_response = self.client.post(
            "/api/register/",
            {
                "email": "tenant@example.com",
                "username": "tenant",
                "first_name": "Tina",
                "last_name": "Tenant",
                "role": "tenant",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
            },
            format="json",
        )

        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", register_response.data["tokens"])

        login_response = self.client.post(
            "/api/login/",
            {"email": "tenant@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(
            "/api/refresh/",
            {"refresh": login_response.data["tokens"]["refresh"]},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['tokens']['access']}"
        )
        me_response = self.client.get("/api/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "tenant@example.com")

    def test_host_profile_alias_requires_authentication(self):
        response = self.client.get("/api/host-profile/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
            first_name="Test",
            last_name="User",
            role="guest",
        )

    def test_user_str(self):
        self.assertEqual(str(self.user), "test@example.com (Guest)")

    def test_full_name(self):
        self.assertEqual(self.user.full_name, "Test User")

    def test_user_role_properties(self):
        self.assertTrue(self.user.is_guest)
        self.assertFalse(self.user.is_host)
        self.assertFalse(self.user.is_tenant)

    def test_host_role(self):
        self.user.role = "host"
        self.user.save()
        self.assertTrue(self.user.is_host)

    def test_tenant_role(self):
        self.user.role = "tenant"
        self.user.save()
        self.assertTrue(self.user.is_tenant)


class RegisterAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "first_name": "New",
            "last_name": "User",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "role": "guest",
        }

    def test_register_success(self):
        response = self.client.post("/api/auth/register/", self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertIn("tokens", response.data)
        self.assertEqual(response.data["user"]["email"], "newuser@example.com")

    def test_register_duplicate_email(self):
        User.objects.create_user(
            email="newuser@example.com", username="existing", password="pass123!"
        )
        response = self.client.post("/api/auth/register/", self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        data = self.valid_data.copy()
        data["password_confirm"] = "DifferentPass!"
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        response = self.client.post("/api/auth/register/", {"email": "a@b.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
            role="guest",
        )

    def test_login_success(self):
        response = self.client.post("/api/auth/login/", {
            "email": "test@example.com",
            "password": "testpass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertIn("user", response.data)

    def test_login_wrong_password(self):
        response = self.client.post("/api/auth/login/", {
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        response = self.client.post("/api/auth/login/", {
            "email": "nobody@example.com",
            "password": "testpass123",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        response = self.client.get("/api/auth/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")

    def test_update_profile(self):
        response = self.client.patch("/api/auth/profile/", {"first_name": "Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/auth/profile/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPass123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        response = self.client.put("/api/auth/change-password/", {
            "old_password": "OldPass123!",
            "new_password": "NewPass456!",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old(self):
        response = self.client.put("/api/auth/change-password/", {
            "old_password": "WrongPass!",
            "new_password": "NewPass456!",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_logout_success(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post("/api/auth/logout/", {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_invalid_token(self):
        response = self.client.post("/api/auth/logout/", {"refresh": "invalid"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
