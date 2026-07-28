from django.contrib import admin
from .models import Amenity, Property, PropertyImage, Review, SavedProperty, Enquiry


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ["name", "icon"]
    search_fields = ["name"]


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "property_type", "price", "city", "status", "created_at"]
    list_filter = ["property_type", "status", "is_furnished", "city"]
    search_fields = ["title", "description", "address"]
    inlines = [PropertyImageInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["property", "user", "rating", "created_at"]
    list_filter = ["rating"]


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display = ["user", "property", "created_at"]


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ["property", "sender", "host", "status", "created_at"]
    list_filter = ["status"]
