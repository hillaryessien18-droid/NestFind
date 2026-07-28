from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"amenities", views.AmenityViewSet)
router.register(r"properties", views.PropertyViewSet, basename="property")
router.register(r"property-images", views.PropertyImageRootViewSet, basename="property-image")
router.register(r"saved-listings", views.SavedListingViewSet, basename="saved-listing")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "properties/<uuid:property_pk>/images/",
        views.PropertyImageViewSet.as_view({"get": "list", "post": "create"}),
        name="property-images-list",
    ),
    path(
        "properties/<uuid:property_pk>/images/<uuid:pk>/",
        views.PropertyImageViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),
        name="property-images-detail",
    ),
    path(
        "properties/<uuid:property_pk>/reviews/",
        views.ReviewViewSet.as_view({"get": "list", "post": "create"}),
        name="property-reviews-list",
    ),
    path(
        "properties/<uuid:property_pk>/reviews/<uuid:pk>/",
        views.ReviewViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),
        name="property-reviews-detail",
    ),
    path(
        "enquiries/",
        views.EnquiryViewSet.as_view({"get": "list", "post": "create"}),
        name="enquiry-list",
    ),
    path(
        "enquiries/<uuid:pk>/",
        views.EnquiryViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),
        name="enquiry-detail",
    ),
]
