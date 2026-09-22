from django.db import migrations, models


def add_seed_photo_urls(apps, schema_editor):
    Property = apps.get_model("properties", "Property")
    PropertyImage = apps.get_model("properties", "PropertyImage")

    # These constants describe the curated seed listings. Keeping their source
    # URLs in the database avoids relying on Render's ephemeral local disk.
    from properties.management.commands.seed_nigeria import (
        PROPERTIES,
        pick_images,
        unsplash_url,
    )

    for index, data in enumerate(PROPERTIES):
        photo_ids = data.get("photo_ids") or pick_images(
            index, data["exterior_pool"], count=3
        )
        property_obj = Property.objects.filter(
            user__email="lagoshost@nestfind.com",
            title=data["title"],
        ).first()
        if property_obj is None:
            continue

        primary = (
            PropertyImage.objects.filter(property=property_obj, is_primary=True)
            .order_by("order", "created_at")
            .first()
        )
        if primary is not None:
            primary.external_url = unsplash_url(photo_ids[0])
            primary.save(update_fields=["external_url"])


class Migration(migrations.Migration):
    dependencies = [
        ("properties", "0005_promote_varied_seed_photos"),
    ]

    operations = [
        migrations.AddField(
            model_name="propertyimage",
            name="external_url",
            field=models.URLField(blank=True, max_length=500),
        ),
        migrations.RunPython(add_seed_photo_urls, migrations.RunPython.noop),
    ]
