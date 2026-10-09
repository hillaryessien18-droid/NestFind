from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase
from payments.models import Notification
from unittest.mock import patch

User = get_user_model()


class AuthenticationEndpointTests(APITestCase):
    @override_settings(EMAIL_DELIVERY_PROVIDER="django")
    def test_registration_sends_welcome_email_and_notification(self):
        response = self.client.post("/api/register/", {
            "email": "new.member@example.com",
            "username": "newmember",
            "first_name": "Amara",
            "last_name": "Okon",
            "role": "guest",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ["new.member@example.com"])
        self.assertEqual(mail.outbox[0].subject, "Welcome to NestFind")
        self.assertIn("Hello Amara,", mail.outbox[0].body)
        self.assertIn("Explore homes", mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].alternatives[0].mimetype, "text/html")
        self.assertEqual(mail.outbox[1].subject, "Verify your NestFind email address")
        self.assertTrue(Notification.objects.filter(
            user__email="new.member@example.com", type="welcome"
        ).exists())

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

    @override_settings(EMAIL_DELIVERY_PROVIDER="django")
    def test_login_success(self):
        response = self.client.post("/api/auth/login/", {
            "email": "test@example.com",
            "password": "testpass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(mail.outbox[0].subject, "New sign-in to your NestFind account")
        self.client.post("/api/auth/login/", {"email": "test@example.com", "password": "testpass123"})
        self.assertEqual(len(mail.outbox), 1)

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

    @override_settings(EMAIL_DELIVERY_PROVIDER="django")
    def test_change_password_success(self):
        response = self.client.put("/api/auth/change-password/", {
            "old_password": "OldPass123!",
            "new_password": "NewPass456!",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.get(pk=self.user.pk).check_password("NewPass456!"))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Your NestFind password was changed")
        self.assertNotIn("NewPass456!", mail.outbox[0].body)

    def test_change_password_wrong_old(self):
        response = self.client.put("/api/auth/change-password/", {
            "old_password": "WrongPass!",
            "new_password": "NewPass456!",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PhoneVerificationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="phone@example.com", username="phoneuser", password="StrongPass123!",
            phone="+2348012345678",
        )
        self.client.force_authenticate(user=self.user)

    @override_settings(BREVO_API_KEY="test-key", BREVO_SMS_SENDER="NestFind")
    @patch("accounts.phone_verification.requests.post")
    def test_send_and_verify_phone_code(self, post):
        post.return_value.status_code = 201
        response = self.client.post("/api/auth/phone/send-code/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = post.call_args.kwargs["json"]
        self.assertEqual(post.call_args.args[0], "https://api.brevo.com/v3/transactionalSMS/send")
        self.assertEqual(post.call_args.kwargs["headers"]["api-key"], "test-key")
        self.assertEqual(payload["recipient"], "2348012345678")
        code = payload["content"].split(" is ")[1][:6]
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.phone_verification_code, code)
        self.assertEqual(self.client.post("/api/auth/phone/send-code/").status_code, 429)
        wrong_code = "000000" if code != "000000" else "111111"
        self.assertEqual(self.client.post("/api/auth/phone/verify/", {"code": wrong_code}).status_code, 400)
        self.assertEqual(self.client.post("/api/auth/phone/verify/", {"code": code}).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.phone_verified)

    @override_settings(BREVO_API_KEY="")
    def test_sms_failure_and_phone_change(self):
        self.assertEqual(self.client.post("/api/auth/phone/send-code/").status_code, 503)
        self.user.phone_verified = True
        self.user.save(update_fields=["phone_verified"])
        response = self.client.patch("/api/auth/profile/", {"phone": "08033334444"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["phone"], "+2348033334444")
        self.assertFalse(response.data["phone_verified"])

    @override_settings(EMAIL_DELIVERY_PROVIDER="django", BREVO_API_KEY="test-key", BREVO_SMS_SENDER="NestFind")
    @patch("accounts.phone_verification.requests.post")
    def test_registration_sends_phone_code(self, post):
        post.return_value.status_code = 201
        self.client.force_authenticate(user=None)
        response = self.client.post("/api/register/", {
            "email": "newphone@example.com", "username": "newphone",
            "first_name": "New", "last_name": "Member", "role": "guest",
            "phone": "08099998888", "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["phone"], "+2348099998888")
        self.assertEqual(post.call_args.kwargs["json"]["recipient"], "2348099998888")
        self.assertFalse(response.data["user"]["phone_verified"])

    @override_settings(BREVO_API_KEY="shared-key", BREVO_SMS_SENDER="NestFind")
    @patch("accounts.phone_verification.requests.post")
    def test_sms_uses_shared_brevo_api_key(self, post):
        post.return_value.status_code = 201
        response = self.client.post("/api/auth/phone/send-code/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(post.call_args.kwargs["headers"]["api-key"], "shared-key")


class EmailVerificationAndResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="secure@example.com", username="secureuser", password="OldPass123!",
            first_name="Amara",
        )

    @override_settings(EMAIL_DELIVERY_PROVIDER="django")
    def test_email_code_is_hashed_rate_limited_and_can_verify(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/auth/email/send-code/")
        self.assertEqual(response.status_code, 200)
        code = mail.outbox[0].body.split("code is ")[1][:6]
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.email_verification_code, code)
        self.assertEqual(self.client.post("/api/auth/email/send-code/").status_code, 429)
        self.assertEqual(self.client.post("/api/auth/email/verify/", {"code": code}).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)

    @override_settings(EMAIL_DELIVERY_PROVIDER="django")
    def test_password_reset_link_is_single_use_and_sends_alert(self):
        request = self.client.post("/api/auth/password-reset/request/", {"email": self.user.email})
        self.assertEqual(request.status_code, 200)
        self.assertEqual(mail.outbox[0].subject, "Reset your NestFind password")
        self.assertEqual(self.client.post("/api/auth/password-reset/request/", {"email": self.user.email}).status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        payload = {"uid": uid, "token": token, "new_password": "NewPass456!"}
        response = self.client.post("/api/auth/password-reset/confirm/", payload)
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass456!"))
        self.assertEqual(mail.outbox[1].subject, "Your NestFind password was changed")
        self.assertEqual(self.client.post("/api/auth/password-reset/confirm/", payload).status_code, 400)

    @override_settings(EMAIL_DELIVERY_PROVIDER="django")
    def test_reset_request_does_not_disclose_unknown_account(self):
        known = self.client.post("/api/auth/password-reset/request/", {"email": self.user.email})
        unknown = self.client.post("/api/auth/password-reset/request/", {"email": "unknown@example.com"})
        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.data, unknown.data)
        self.assertEqual(len(mail.outbox), 1)


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
