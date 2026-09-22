from pathlib import Path

from django.core.files.base import ContentFile
from django.db import migrations


PHOTO_NAME = "uyo-shelter-afrique-bungalow.jpg"
SEED_HOST_EMAIL = "lagoshost@nestfind.com"
PROPERTY_TITLE = "3-Bedroom Bungalow, Shelter Afrique, Uyo"


def update_uyo_bungalow_photo(apps, schema_editor):
    PropertyImage = apps.get_model("properties", "PropertyImage")
    image = (
        PropertyImage.objects.using(schema_editor.connection.alias)
        .filter(
            property__title=PROPERTY_TITLE,
            property__user__email=SEED_HOST_EMAIL,
            is_primary=True,
        )
        .first()
    )
    if image is None:
        return

    asset_path = Path(__file__).resolve().parents[1] / "seed_assets" / PHOTO_NAME
    image.image.save(PHOTO_NAME, ContentFile(asset_path.read_bytes()), save=False)
    image.external_url = ""
    image.caption = "Illustrative photo of a single-storey bungalow"
    image.save(update_fields=["image", "external_url", "caption"])


class Migration(migrations.Migration):
    dependencies = [
        ("properties", "0006_propertyimage_external_url"),
    ]

    operations = [
        migrations.RunPython(update_uyo_bungalow_photo, migrations.RunPython.noop),
    ]
