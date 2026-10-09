from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    ROLE_CHOICES = [
        ("guest", "Guest"),
        ("tenant", "Tenant"),
        ("host", "Host"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)
    phone_verification_code = models.CharField(max_length=128, blank=True)
    phone_verification_expires_at = models.DateTimeField(null=True, blank=True)
    phone_verification_sent_at = models.DateTimeField(null=True, blank=True)
    phone_verification_attempts = models.PositiveSmallIntegerField(default=0)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="guest")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    email_verification_code = models.CharField(max_length=128, blank=True)
    email_verification_expires_at = models.DateTimeField(null=True, blank=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    email_verification_attempts = models.PositiveSmallIntegerField(default=0)
    password_reset_requested_at = models.DateTimeField(null=True, blank=True)
    login_alert_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_host(self):
        return self.role == "host"

    @property
    def is_tenant(self):
        return self.role == "tenant"

    @property
    def is_guest(self):
        return self.role == "guest"
