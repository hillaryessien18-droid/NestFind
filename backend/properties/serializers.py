from rest_framework import serializers
from .models import Amenity, Property, PropertyImage, Review, SavedProperty, Enquiry


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name", "icon"]


def build_absolute_url(request, url):
    if not url:
        return None
    if request:
        return request.build_absolute_uri(url)
    return url


class PropertyImageSerializer(serializers.ModelSerializer):
    property = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(),
        required=False,
    )
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "property", "image", "caption", "is_primary", "order"]
        read_only_fields = ["id"]

    def get_image(self, obj):
        return build_absolute_url(self.context.get("request"), obj.image.url)


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    def get_primary_image(self, obj):
        return build_absolute_url(self.context.get("request"), obj.primary_image)

    class Meta:
        model = Property
        fields = [
            "id", "title", "property_type", "status", "price",
            "bedrooms", "bathrooms", "area_sqft", "city", "state",
            "country", "primary_image", "average_rating", "review_count",
            "user_name", "views_count", "created_at",
        ]


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_avatar = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    def get_user_avatar(self, obj):
        if not obj.user.avatar:
            return None
        return build_absolute_url(self.context.get("request"), obj.user.avatar.url)

    class Meta:
        model = Property
        fields = [
            "id", "title", "description", "property_type", "status", "price",
            "bedrooms", "bathrooms", "area_sqft", "address", "city", "state",
            "country", "zip_code", "latitude", "longitude", "images",
            "amenities", "is_furnished", "available_from", "minimum_lease_months",
            "max_guests", "views_count", "average_rating", "review_count",
            "user", "user_name", "user_avatar", "is_saved", "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "views_count", "created_at", "updated_at"]

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SavedProperty.objects.filter(
                user=request.user, property=obj
            ).exists()
        return False


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    amenity_ids = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, write_only=True, source="amenities"
    )

    class Meta:
        model = Property
        fields = [
            "id", "title", "description", "property_type", "status", "price",
            "bedrooms", "bathrooms", "area_sqft", "address", "city", "state",
            "country", "zip_code", "latitude", "longitude", "amenity_ids",
            "amenities", "is_furnished", "available_from", "minimum_lease_months",
            "max_guests", "images",
        ]
        read_only_fields = ["id", "images"]


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "property", "user", "user_name", "user_email",
            "rating", "comment", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "property", "user", "created_at", "updated_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        view = self.context.get("view")
        property_pk = getattr(view, "kwargs", {}).get("property_pk") if view else None

        if request and request.method == "POST" and property_pk:
            if Review.objects.filter(property_id=property_pk, user=request.user).exists():
                raise serializers.ValidationError(
                    "You have already reviewed this property."
                )

        return attrs


class SavedPropertySerializer(serializers.ModelSerializer):
    property_detail = PropertyListSerializer(source="property", read_only=True)

    class Meta:
        model = SavedProperty
        fields = ["id", "property", "property_detail", "created_at"]
        read_only_fields = ["id", "created_at"]


class EnquirySerializer(serializers.ModelSerializer):
    sender_email = serializers.CharField(source="sender.email", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "id", "property", "property_title", "sender", "sender_email",
            "host", "message", "phone", "status", "created_at",
        ]
        read_only_fields = ["id", "sender", "host", "status", "created_at"]
