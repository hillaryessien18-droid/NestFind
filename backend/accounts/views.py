from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from datetime import timedelta
from payments.models import Notification
from .emails import (
    send_login_alert_email, send_password_changed_email, send_password_reset_email,
    send_registration_welcome_email,
)
from .email_verification import send_email_code, verify_email_code
from .phone_verification import send_phone_code, verify_phone_code
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    ProfileUpdateSerializer,
)
from .permissions import IsProfileOwner

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Notification.objects.create(
            user=user,
            title="Welcome to NestFind",
            message=(
                "Your account is ready. Complete your email and phone verification, then create your first listing from your dashboard."
                if user.role == "host" else
                "Your account is ready. Complete your email and phone verification, then explore available homes and save your favourites."
            ),
            type="welcome",
            link="/my-properties" if user.role == "host" else "/properties",
        )
        send_registration_welcome_email(user)
        email_verification_sent = send_email_code(user) == "sent"
        phone_verification_sent = send_phone_code(user, welcome=True) == "sent" if user.phone else False
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "phone_verification_sent": phone_verification_sent,
                "email_verification_sent": email_verification_sent,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        if not user.login_alert_sent_at or timezone.now() - user.login_alert_sent_at >= timedelta(minutes=15):
            if send_login_alert_email(user):
                user.login_alert_sent_at = timezone.now()
                user.save(update_fields=["login_alert_sent_at"])
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Successfully logged out."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfileOwner]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(
            self.get_object(),
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        send_password_changed_email(request.user)
        return Response({"message": "Password changed successfully."})


class SendEmailVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = send_email_code(request.user)
        if result == "sent":
            return Response({"message": "Verification code sent by email."})
        if result == "rate_limited":
            return Response({"error": "Wait one minute before requesting another code."}, status=429)
        if result == "already_verified":
            return Response({"message": "Email address is already verified."})
        return Response({"error": "Email is currently unavailable. Please try again later."}, status=503)


class VerifyEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = str(request.data.get("code", ""))
        if not (len(code) == 6 and code.isascii() and code.isdecimal()):
            return Response({"error": "Enter the six-digit verification code."}, status=400)
        if not verify_email_code(request.user, code):
            return Response({"error": "Invalid or expired code. Request a new code if needed."}, status=400)
        return Response({"message": "Email address verified."})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        user = User.objects.filter(email__iexact=email, is_active=True).first() if email else None
        if user and (
            not user.password_reset_requested_at
            or timezone.now() - user.password_reset_requested_at >= timedelta(seconds=60)
        ):
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/{uid}/{token}"
            if send_password_reset_email(user, url):
                user.password_reset_requested_at = timezone.now()
                user.save(update_fields=["password_reset_requested_at"])
        return Response({"message": "If an account exists for this email, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            user_id = force_str(urlsafe_base64_decode(str(request.data.get("uid", ""))))
            user = User.objects.get(pk=user_id, is_active=True)
        except (ValueError, TypeError, OverflowError, ValidationError, User.DoesNotExist):
            return Response({"error": "This reset link is invalid or expired."}, status=400)
        token = str(request.data.get("token", ""))
        if not default_token_generator.check_token(user, token):
            return Response({"error": "This reset link is invalid or expired."}, status=400)
        password = request.data.get("new_password", "")
        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response({"new_password": error.messages}, status=400)
        user.set_password(password)
        user.save(update_fields=["password"])
        send_password_changed_email(user)
        return Response({"message": "Password reset successfully. Please sign in."})


class SendPhoneVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = send_phone_code(request.user)
        if result == "sent":
            return Response({"message": "Verification code sent by SMS."})
        if result == "rate_limited":
            return Response({"error": "Wait one minute before requesting another code."}, status=429)
        if result == "missing_phone":
            return Response({"error": "Add a phone number to your profile first."}, status=400)
        if result == "already_verified":
            return Response({"message": "Phone number is already verified."})
        return Response({"error": "SMS is currently unavailable. Please try again later."}, status=503)


class VerifyPhoneView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = str(request.data.get("code", ""))
        if not (len(code) == 6 and code.isascii() and code.isdecimal()):
            return Response({"error": "Enter the six-digit verification code."}, status=400)
        if not verify_phone_code(request.user, code):
            return Response({"error": "Invalid or expired code. Request a new code if needed."}, status=400)
        return Response({"message": "Phone number verified."})


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering_fields = ["created_at", "email"]
