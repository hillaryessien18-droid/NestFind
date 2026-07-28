import urllib.request
from datetime import date, timedelta
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from accounts.models import User
from properties.models import Amenity, Property, PropertyImage, Review

MEDIA_DIR = Path(settings.MEDIA_ROOT) / "properties"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def unsplash_url(photo_id, w=1400):
    return f"https://images.unsplash.com/photo-{photo_id}?w={w}&q=80&auto=format&fit=crop"


# Verified, working Unsplash image ids.
LAGOS_EXTERIORS = [
    "1643297551340-19d8ad4f20ad",  # duplex in Lagos
    "1661332628548-082c0b446ee1",  # brick house, Nigeria
    "1640475169249-2df3c29a1bba",  # Lagos Island skyline
    "1749058387715-1efad0eadc8c",  # Victoria Island cityscape
    "1749058388308-744fdc8991ed",  # Victoria Island buildings & ocean
]
HOUSE_EXTERIORS = [
    "1600596542815-ffad4c1539a9",
    "1512917774080-9991f1c4c750",
    "1600607687939-ce8a6c25118c",
    "1518780664697-55e3ad937233",
    "1613490493576-7fde63acd811",
    "1600585154340-be6161a56a0c",
    "1564013799919-ab600027ffc6",
    "1600047509807-ba8f99d2cdde",
    "1580587771525-78b9dba3b914",
    "1568605114967-8130f3a36994",
    "1600210492486-724fe5c67fb0",
]
APARTMENT_BUILDINGS = [
    "1545324418-cc1a3fa10c00",
    "1768760906477-70190a413c6d",
    "1769147555077-2a4d50639695",
    "1770962282626-61b2f4931bf7",
    "1556784344-ad913c73cfc4",
    "1640475169249-2df3c29a1bba",  # Lagos Island skyline
    "1749058387715-1efad0eadc8c",  # Victoria Island cityscape
    "1749058388308-744fdc8991ed",  # Victoria Island buildings & ocean
]
INTERIORS = [
    "1560448204-e02f11c3d0e2",
    "1522708323590-d24dbb6b0267",
]


def pick_images(index, exterior_pool, count=4):
    # Primary photo cycles through Lagos-specific shots first, then
    # the type-appropriate exterior pool, so Lagos imagery is front and centre.
    pool = LAGOS_EXTERIORS + exterior_pool
    images = [pool[index % len(pool)]]
    for i in range(1, count):
        images.append(INTERIORS[(index + i) % len(INTERIORS)])
        if len(images) >= count:
            break
    return images[:count]


def download_image(photo_id, name):
    url = unsplash_url(photo_id)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=40) as response:
            data = response.read()
    except Exception:
        return None
    if len(data) < 5000:
        return None
    return ContentFile(data, name=f"{name}.jpg")


AMENITIES = [
    ("Prepaid Meter", "zap"),
    ("Borehole Water Supply", "droplets"),
    ("POP Ceiling", "layout"),
    ("Tiled Floor", "square"),
    ("Boys' Quarters", "home"),
    ("Parking Space", "car"),
    ("24/7 Security", "shield"),
    ("CCTV Surveillance", "video"),
    ("Backup Generator", "battery-charging"),
    ("Gated Estate", "fence"),
    ("Swimming Pool", "waves"),
    ("Gym", "dumbbell"),
    ("Kids Playground", "baby"),
    ("Fibre Internet", "wifi"),
    ("Air Conditioning", "snowflake"),
    ("Kitchen Cabinet", "kitchen"),
    ("Walk-in Wardrobe", "shirt"),
    ("Water Heater", "thermometer"),
    ("Inverter Power Backup", "plug"),
    ("Balcony", "sun"),
]

PROPERTIES = [
    {
        "title": "Luxury 3-Bedroom Serviced Apartment, Victoria Island",
        "description": (
            "Premium serviced apartment in the heart of Victoria Island with lagoon views. "
            "Features a fully furnished lounge, modern kitchen with granite countertops, "
            "master ensuite with bathtub, standby generator and 24/7 security. "
            "Perfect for executives and expatriates. Rent is payable annually with a "
            "service charge covering maintenance, security and estate cleaning."
        ),
        "property_type": "apartment",
        "price": 1850000,
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 2100,
        "address": "14 Adeola Odeku Street, Victoria Island",
        "city": "Victoria Island",
        "state": "Lagos",
        "latitude": 6.4281,
        "longitude": 3.4219,
        "is_furnished": True,
        "max_guests": 5,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "2-Bedroom Serviced Apartment, Lekki Phase 1",
        "description": (
            "Beautifully finished 2-bedroom apartment in a gated estate in Lekki Phase 1. "
            "Open-plan living and dining area, fitted kitchen, en-suite master bedroom with "
            "walk-in closet, and a balcony overlooking the estate. Includes borehole water, "
            "prepaid meter and 24/7 power backup."
        ),
        "property_type": "apartment",
        "price": 950000,
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1300,
        "address": "7 Admiralty Way, Lekki Phase 1",
        "city": "Lekki",
        "state": "Lagos",
        "latitude": 6.4482,
        "longitude": 3.4702,
        "is_furnished": True,
        "max_guests": 4,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "4-Bedroom Terrace Duplex, Ikoyi",
        "description": (
            "Spacious 4-bedroom terrace duplex in a serene Ikoyi estate. Large living room, "
            "dining area, modern fitted kitchen, family lounge upstairs, four en-suite bedrooms "
            "and a rooftop terrace. 24/7 power, water and estate security included."
        ),
        "property_type": "house",
        "price": 2400000,
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 3200,
        "address": "25 Bourdillon Road, Ikoyi",
        "city": "Ikoyi",
        "state": "Lagos",
        "latitude": 6.4492,
        "longitude": 3.4344,
        "is_furnished": True,
        "max_guests": 6,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "3-Bedroom Bungalow, Ikeja GRA",
        "description": (
            "Detached 3-bedroom bungalow in a quiet street in Ikeja GRA. Tiled throughout, "
            "POP ceilings, fitted kitchen, generous compound with a boys' quarters and "
            "parking for two cars. Ideal for a family."
        ),
        "property_type": "house",
        "price": 750000,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1800,
        "address": "8 Adekunle Fajuyi Way, Ikeja GRA",
        "city": "Ikeja",
        "state": "Lagos",
        "latitude": 6.6037,
        "longitude": 3.3515,
        "is_furnished": False,
        "max_guests": 5,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "2-Bedroom Condo, Magodo GRA Phase 2",
        "description": (
            "Modern 2-bedroom condo in a well-secured estate in Magodo GRA Phase 2. "
            "En-suite master, fitted kitchen with cabinets, balcony, parking space and "
            "access to the estate's gym and swimming pool."
        ),
        "property_type": "condo",
        "price": 650000,
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1100,
        "address": "12 Oshin Street, Magodo GRA Phase 2",
        "city": "Magodo",
        "state": "Lagos",
        "latitude": 6.5986,
        "longitude": 3.3980,
        "is_furnished": True,
        "max_guests": 3,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "Self-Contained Studio Apartment, Yaba",
        "description": (
            "Compact self-contained studio apartment close to Yaba tech hub and NYSC camp. "
            "Tiled floor, mini kitchen, en-suite bathroom and prepaid meter. Perfect for "
            "young professionals and students."
        ),
        "property_type": "studio",
        "price": 180000,
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 350,
        "address": "31 Herbert Macaulay Way, Yaba",
        "city": "Yaba",
        "state": "Lagos",
        "latitude": 6.5060,
        "longitude": 3.3750,
        "is_furnished": False,
        "max_guests": 2,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "3-Bedroom Flat, Surulere",
        "description": (
            "Neat 3-bedroom flat on the 2nd floor of a well-maintained block in Surulere. "
            "Spacious sitting room, kitchen with cabinets, two toilets and a bathroom, "
            "with borehole water and a standby generator."
        ),
        "property_type": "apartment",
        "price": 520000,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1400,
        "address": "16 Ojuelegba Road, Surulere",
        "city": "Surulere",
        "state": "Lagos",
        "latitude": 6.5013,
        "longitude": 3.3500,
        "is_furnished": False,
        "max_guests": 5,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "5-Bedroom Detached House, Ajah",
        "description": (
            "Grand 5-bedroom detached house with a large living room, dining area, study, "
            "guest room, and an outbuilding. Fully wall-fenced in a gated community in Ajah. "
            "Ideal for a large family or corporate staff housing."
        ),
        "property_type": "house",
        "price": 1200000,
        "bedrooms": 5,
        "bathrooms": 5,
        "area_sqft": 4000,
        "address": "23 Chevron Drive, Ajah",
        "city": "Ajah",
        "state": "Lagos",
        "latitude": 6.4725,
        "longitude": 3.5777,
        "is_furnished": False,
        "max_guests": 8,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "1-Bedroom Apartment, Gbagada Phase 1",
        "description": (
            "Cozy 1-bedroom apartment in a small serviced block in Gbagada Phase 1. "
            "Tiled floor, fitted kitchen, en-suite bathroom and parking space. "
            "Close to expressway access for easy commute."
        ),
        "property_type": "apartment",
        "price": 350000,
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 700,
        "address": "5 Adebayo Doherty Street, Gbagada Phase 1",
        "city": "Gbagada",
        "state": "Lagos",
        "latitude": 6.5420,
        "longitude": 3.3870,
        "is_furnished": False,
        "max_guests": 2,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "4-Bedroom Duplex, Lekki Phase 2",
        "description": (
            "Semi-detached 4-bedroom duplex with a BQ in a peaceful estate in Lekki Phase 2. "
            "Four en-suite bedrooms, spacious living and dining areas, fitted kitchen, "
            "private compound and paved parking. 24/7 power and water supply."
        ),
        "property_type": "house",
        "price": 1400000,
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 3000,
        "address": "9 Ikate Road, Lekki Phase 2",
        "city": "Lekki",
        "state": "Lagos",
        "latitude": 6.4430,
        "longitude": 3.5100,
        "is_furnished": False,
        "max_guests": 6,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "2-Bedroom Condo, Maryland",
        "description": (
            "Bright 2-bedroom condo in Maryland, a short drive from Ikeja and the airport. "
            "En-suite master, fitted kitchen, balcony, dedicated parking and generator. "
            "Ideal for professionals working on the mainland."
        ),
        "property_type": "condo",
        "price": 450000,
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1000,
        "address": "3 Mobolaji Bank-Anthony Way, Maryland",
        "city": "Maryland",
        "state": "Lagos",
        "latitude": 6.5915,
        "longitude": 3.3507,
        "is_furnished": True,
        "max_guests": 3,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "Executive 3-Bedroom Apartment, Banana Island",
        "description": (
            "Ultra-luxury executive apartment on Banana Island with panoramic waterfront views. "
            "Floor-to-ceiling windows, designer interiors, private lift lobby, gym and pool "
            "access, and round-the-clock estate security. Service charge payable separately."
        ),
        "property_type": "apartment",
        "price": 3500000,
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 2500,
        "address": "Banana Island Estate, Ikoyi",
        "city": "Ikoyi",
        "state": "Lagos",
        "latitude": 6.4418,
        "longitude": 3.4214,
        "is_furnished": True,
        "max_guests": 5,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "3-Bedroom Townhouse, Ogudu GRA",
        "description": (
            "Well-laid-out 3-bedroom townhouse in Ogudu GRA. Open-plan lounge and dining, "
            "fitted kitchen, upstairs family room, small courtyard and parking. "
            "Estate has constant water and security."
        ),
        "property_type": "townhouse",
        "price": 550000,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1600,
        "address": "11 Toyin Street, Ogudu GRA",
        "city": "Ogudu",
        "state": "Lagos",
        "latitude": 6.6090,
        "longitude": 3.3935,
        "is_furnished": False,
        "max_guests": 5,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "Serviced Studio, Victoria Island",
        "description": (
            "Elegant serviced studio apartment in a boutique building on Victoria Island. "
            "Fully furnished with a queen bed, work desk, smart TV and ensuite bathroom. "
            "Housekeeping, laundry and Wi-Fi included in the service charge."
        ),
        "property_type": "studio",
        "price": 400000,
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 450,
        "address": "20 Awolowo Road, Victoria Island",
        "city": "Victoria Island",
        "state": "Lagos",
        "latitude": 6.4329,
        "longitude": 3.4284,
        "is_furnished": True,
        "max_guests": 2,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
    {
        "title": "6-Bedroom Luxury Villa, Oniru",
        "description": (
            "Stunning 6-bedroom luxury villa in a prime Oniru location, minutes from the beach. "
            "Large swimming pool, landscaped garden, cinema room, gym, boys' quarters and "
            "parking for four vehicles. The epitome of Lagos luxury living."
        ),
        "property_type": "villa",
        "price": 4200000,
        "bedrooms": 6,
        "bathrooms": 7,
        "area_sqft": 5500,
        "address": "4 Oniru Estate, Victoria Island",
        "city": "Victoria Island",
        "state": "Lagos",
        "latitude": 6.4344,
        "longitude": 3.4451,
        "is_furnished": True,
        "max_guests": 10,
        "exterior_pool": HOUSE_EXTERIORS,
    },
    {
        "title": "3-Bedroom Apartment, Festac Town",
        "description": (
            "Affordable 3-bedroom apartment in the well-planned residential area of Festac Town. "
            "Tiled floor, POP ceiling, fitted kitchen and shared compound amenities. "
            "Great value for money close to the airport road."
        ),
        "property_type": "apartment",
        "price": 300000,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1300,
        "address": "47 2nd Avenue, Festac Town",
        "city": "Festac Town",
        "state": "Lagos",
        "latitude": 6.4713,
        "longitude": 3.2830,
        "is_furnished": False,
        "max_guests": 5,
        "exterior_pool": APARTMENT_BUILDINGS,
    },
]

REVIEWS = [
    ("The property is exactly as advertised. Clean, secure and the agent was very professional.", 5),
    ("Great location and value for money. Neighbours are quiet and the estate is well run.", 4),
    ("Beautiful finishes and constant power supply. I highly recommend this apartment.", 5),
    ("The management responds quickly to any issues. Solid choice for families.", 4),
    ("Modern, spacious and secure. The water heater in the master bath is a nice touch.", 5),
]


class Command(BaseCommand):
    help = "Seed the database with Nigerian (Lagos) real estate listings, photos and demo users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Delete existing seed data before recreating it.",
        )

    def handle(self, *args, **options):
        force = options["force"]
        self._create_users(force)
        self._create_amenities()
        self._create_properties(force)
        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))

    def _create_users(self, force):
        host, created = User.objects.get_or_create(
            email="lagoshost@nestfind.com",
            defaults={
                "username": "lagoshost",
                "first_name": "Chuka",
                "last_name": "Okafor",
                "phone": "+2348012345678",
                "role": "host",
                "is_verified": True,
                "is_staff": True,
                "bio": "Professional real estate agent covering Lagos island and mainland.",
            },
        )
        if created:
            host.set_password("Host@2026")
            host.save()

        for name in ["Adaeze", "Tunde", "Ngozi", "Emeka"]:
            email = f"{name.lower()}@nestfind.com"
            tenant, t_created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": name.lower(),
                    "first_name": name,
                    "last_name": "Bello",
                    "phone": "+2348023456789",
                    "role": "tenant",
                    "is_verified": True,
                    "bio": "Looking for a comfortable place to call home in Lagos.",
                },
            )
            if t_created:
                tenant.set_password("Tenant@2026")
                tenant.save()

        if force:
            from properties.models import Enquiry, SavedProperty

            Enquiry.objects.filter(host=host).delete()
            SavedProperty.objects.filter(user__in=User.objects.filter(
                email__endswith="@nestfind.com"
            )).delete()

        self.stdout.write(f"Demo host ready: {host.email} / Host@2026")

    def _create_amenities(self):
        for name, icon in AMENITIES:
            Amenity.objects.get_or_create(name=name, defaults={"icon": icon})
        self.stdout.write(f"Amenities ready: {Amenity.objects.count()}")

    def _create_properties(self, force):
        host = User.objects.get(email="lagoshost@nestfind.com")
        tenants = list(User.objects.filter(role="tenant").order_by("email"))

        existing = Property.objects.filter(user=host)
        if force:
            existing.delete()
        elif existing.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Demo host already has {existing.count()} properties. "
                    "Use --force to rebuild them."
                )
            )
            return

        amenities = list(Amenity.objects.all())
        image_count = 0
        failed_images = 0

        for index, data in enumerate(PROPERTIES):
            data = dict(data)
            exterior_pool = data.pop("exterior_pool")
            prop = Property.objects.create(
                user=host,
                status="active",
                country="Nigeria",
                zip_code="100001",
                available_from=date.today() + timedelta(days=7),
                minimum_lease_months=12,
                views_count=(index + 1) * 137,
                **data,
            )
            prop.amenities.set(
                amenities[index % len(amenities): index % len(amenities) + 7]
                or amenities[:7]
            )

            for img_index, photo_id in enumerate(pick_images(index, exterior_pool)):
                image_file = download_image(photo_id, f"lagos_{index + 1}_{img_index + 1}")
                if image_file is None:
                    failed_images += 1
                    continue
                PropertyImage.objects.create(
                    property=prop,
                    image=image_file,
                    caption=f"{prop.title} - photo {img_index + 1}",
                    is_primary=img_index == 0,
                    order=img_index,
                )
                image_count += 1

            if tenants:
                Review.objects.create(
                    property=prop,
                    user=tenants[index % len(tenants)],
                    rating=REVIEWS[index % len(REVIEWS)][1],
                    comment=REVIEWS[index % len(REVIEWS)][0],
                )
                Review.objects.create(
                    property=prop,
                    user=tenants[(index + 1) % len(tenants)],
                    rating=4,
                    comment="Very responsive host and accurate listing photos.",
                )

            self.stdout.write(f"  + {prop.title}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(PROPERTIES)} properties, {image_count} images "
                f"({failed_images} downloads failed)."
            )
        )
