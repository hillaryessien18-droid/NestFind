from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.HostDashboardView.as_view(), name="dashboard"),
    path("dashboard/host/", views.HostDashboardView.as_view(), name="host-dashboard"),
    path("stats/", views.PlatformStatsView.as_view(), name="platform-stats"),
]
