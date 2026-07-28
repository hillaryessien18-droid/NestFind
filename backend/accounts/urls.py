from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register-alias"),
    path("login/", views.LoginView.as_view(), name="login-alias"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh-alias"),
    path("me/", views.ProfileView.as_view(), name="me"),
    path("host-profile/", views.ProfileView.as_view(), name="host-profile"),
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/profile/", views.ProfileView.as_view(), name="profile"),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path("users/", views.UserListView.as_view(), name="user-list"),
]
