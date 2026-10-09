from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import re

User = get_user_model()


def normalize_phone(value):
    phone = re.sub(r"[\s()-]", "", value or "")
    if phone.startswith("0") and len(phone) == 11:
        phone = "+234" + phone[1:]
    if phone and not re.fullmatch(r"\+[1-9]\d{9,14}", phone):
        raise serializers.ValidationError("Enter a phone number with country code, such as +2348012345678.")
    return phone


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    properties_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "full_name", "phone", "role", "avatar", "bio",
            "is_verified", "email_verified", "phone_verified", "properties_count", "created_at",
        ]
        read_only_fields = ["id", "is_verified", "email_verified", "phone_verified", "created_at"]

    def get_properties_count(self, obj):
        if obj.role == "host":
            return obj.properties.count()
        return 0


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate_phone(self, value):
        return normalize_phone(value)

    class Meta:
        model = User
        fields = [
            "email", "username", "first_name", "last_name",
            "phone", "role", "password", "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        if attrs.get("role") not in ["guest", "tenant", "host"]:
            raise serializers.ValidationError({"role": "Invalid role. Choose guest, tenant, or host."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    def validate_phone(self, value):
        return normalize_phone(value)

    def update(self, instance, validated_data):
        phone = validated_data.get("phone", instance.phone)
        if phone != instance.phone:
            instance.phone_verified = False
            instance.phone_verification_code = ""
            instance.phone_verification_expires_at = None
            instance.phone_verification_sent_at = None
            instance.phone_verification_attempts = 0
        return super().update(instance, validated_data)

    class Meta:
        model = User
        fields = [
            "first_name", "last_name", "phone", "avatar", "bio",
        ]
