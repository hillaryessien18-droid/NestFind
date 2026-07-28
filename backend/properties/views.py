from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Amenity, Property, PropertyImage, Review, SavedProperty, Enquiry
from .serializers import (
    AmenitySerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateUpdateSerializer,
    PropertyImageSerializer,
    ReviewSerializer,
    SavedPropertySerializer,
    EnquirySerializer,
)
from .permissions import IsPropertyOwner, IsEnquiryRecipient, IsHost


class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    search_fields = ["name"]


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.select_related("user").prefetch_related(
        "images", "amenities", "reviews"
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "property_type": ["exact"],
        "status": ["exact"],
        "city": ["exact", "icontains"],
        "state": ["exact", "icontains"],
        "country": ["exact"],
        "bedrooms": ["exact", "gte", "lte"],
        "bathrooms": ["exact", "gte", "lte"],
        "price": ["gte", "lte"],
        "area_sqft": ["gte", "lte"],
        "is_furnished": ["exact"],
    }
    search_fields = ["title", "description", "address", "city", "state"]
    ordering_fields = ["price", "created_at", "views_count", "area_sqft", "bedrooms"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return PropertyListSerializer
        elif self.action in ("create", "update", "partial_update"):
            return PropertyCreateUpdateSerializer
        return PropertyDetailSerializer

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated(), IsHost()]
        elif self.action in ("my_properties", "saved"):
            return [permissions.IsAuthenticated()]
        elif self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsPropertyOwner()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=["views_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_properties(self, request):
        properties = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(serializer.data)
        serializer = PropertyListSerializer(properties, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def saved(self, request):
        saved = SavedProperty.objects.filter(user=request.user).select_related(
            "property__user", "property"
        )
        properties = [s.property for s in saved]
        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(serializer.data)
        serializer = PropertyListSerializer(properties, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        properties = self.get_queryset().filter(status="active").order_by("-views_count")[:6]
        serializer = PropertyListSerializer(properties, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def similar(self, request, pk=None):
        property_obj = self.get_object()
        properties = (
            self.get_queryset()
            .filter(status="active")
            .exclude(pk=property_obj.pk)
            .filter(
                Q(city__iexact=property_obj.city)
                | Q(property_type=property_obj.property_type)
                | Q(bedrooms=property_obj.bedrooms)
            )
            .order_by("-created_at")[:6]
        )
        serializer = PropertyListSerializer(properties, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        property_obj = self.get_object()
        saved, created = SavedProperty.objects.get_or_create(
            user=request.user, property=property_obj
        )
        if not created:
            saved.delete()
            return Response({"saved": False, "message": "Property unsaved."})
        return Response({"saved": True, "message": "Property saved."})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def images(self, request, pk=None):
        property_obj = self.get_object()
        if property_obj.user != request.user:
            return Response(
                {"error": "You can only upload images to your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )
        images = request.FILES.getlist("images")
        created_images = []
        for i, image in enumerate(images):
            img = PropertyImage.objects.create(
                property=property_obj,
                image=image,
                is_primary=i == 0 and not property_obj.images.exists(),
                order=i,
            )
            created_images.append(img)
        return Response(
            PropertyImageSerializer(created_images, many=True).data,
            status=status.HTTP_201_CREATED,
        )


class PropertyImageViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PropertyImage.objects.filter(property_id=self.kwargs["property_pk"])

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs["property_pk"])


class PropertyImageRootViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PropertyImage.objects.filter(property__user=self.request.user).select_related(
            "property"
        )

    def perform_create(self, serializer):
        property_obj = serializer.validated_data.get("property")
        if property_obj is None:
            raise ValidationError({"property": "This field is required."})
        if property_obj.user != self.request.user:
            raise PermissionDenied("You can only upload images to your own properties.")
        serializer.save()


class SavedListingViewSet(viewsets.ModelViewSet):
    serializer_class = SavedPropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedProperty.objects.filter(user=self.request.user).select_related(
            "property", "property__user"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="toggle/(?P<property_pk>[^/.]+)")
    def toggle(self, request, property_pk=None):
        property_obj = generics.get_object_or_404(Property, pk=property_pk)
        saved, created = SavedProperty.objects.get_or_create(
            user=request.user,
            property=property_obj,
        )
        if not created:
            saved.delete()
            return Response({"saved": False, "message": "Property unsaved."})
        return Response({"saved": True, "message": "Property saved."})


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(property_id=self.kwargs["property_pk"]).select_related("user")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            property_id=self.kwargs["property_pk"],
        )


class EnquiryViewSet(viewsets.ModelViewSet):
    serializer_class = EnquirySerializer
    permission_classes = [permissions.IsAuthenticated, IsEnquiryRecipient]

    def get_queryset(self):
        user = self.request.user
        return Enquiry.objects.filter(
            Q(sender=user) | Q(host=user)
        ).select_related("property", "sender", "host")

    def perform_create(self, serializer):
        property_obj = serializer.validated_data["property"]
        serializer.save(
            sender=self.request.user,
            host=property_obj.user,
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def respond(self, request, pk=None):
        enquiry = self.get_object()
        if enquiry.host != request.user:
            return Response(
                {"error": "Only the host can respond to enquiries."},
                status=status.HTTP_403_FORBIDDEN,
            )
        enquiry.status = "responded"
        enquiry.save(update_fields=["status"])
        return Response({"message": "Enquiry marked as responded."})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def close(self, request, pk=None):
        enquiry = self.get_object()
        if enquiry.host != request.user:
            return Response(
                {"error": "Only the host can close enquiries."},
                status=status.HTTP_403_FORBIDDEN,
            )
        enquiry.status = "closed"
        enquiry.save(update_fields=["status"])
        return Response({"message": "Enquiry closed."})
