from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from payments.models import Notification
from .emails import send_password_changed_email, send_registration_welcome_email
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
                "Your NestFind account is ready. Start by adding your first listing."
                if user.role == "host" else
                "Your NestFind account is ready. Explore homes and save the places you love."
            ),
            type="welcome",
            link="/my-properties" if user.role == "host" else "/properties",
        )
        send_registration_welcome_email(user)
        phone_verification_sent = send_phone_code(user) == "sent" if user.phone else False
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "phone_verification_sent": phone_verification_sent,
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
