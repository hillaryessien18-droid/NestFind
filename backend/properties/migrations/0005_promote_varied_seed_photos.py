from django.db import migrations


SEED_HOST_EMAIL = "lagoshost@nestfind.com"


def promote_varied_seed_photos(apps, schema_editor):
    Property = apps.get_model("properties", "Property")
    PropertyImage = apps.get_model("properties", "PropertyImage")

    properties = Property.objects.filter(user__email=SEED_HOST_EMAIL).iterator()
    for property_obj in properties:
        current_primary = (
            PropertyImage.objects.filter(property=property_obj, is_primary=True)
            .order_by("order", "id")
            .first()
        )
        varied_photo = (
            PropertyImage.objects.filter(property=property_obj, is_primary=False)
            .order_by("order", "id")
            .first()
        )
        if varied_photo is None:
            continue

        if current_primary is not None:
            current_primary.is_primary = False
            current_primary.order = max(current_primary.order, 3)
            current_primary.save(update_fields=["is_primary", "order"])

        varied_photo.is_primary = True
        varied_photo.order = 0
        varied_photo.save(update_fields=["is_primary", "order"])


class Migration(migrations.Migration):
    dependencies = [
        ("properties", "0004_alter_review_unique_together_and_more"),
    ]

    operations = [
        migrations.RunPython(promote_varied_seed_photos, migrations.RunPython.noop),
    ]
