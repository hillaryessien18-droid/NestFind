import { MapPin, BedDouble, Bath, Maximize, Heart, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1643297551340-19d8ad4f20ad?w=600&h=400&fit=crop';

const TYPE_LABELS = {
  apartment: 'Apartment',
  house: 'House',
  condo: 'Condo',
  studio: 'Studio',
  villa: 'Villa',
  townhouse: 'Townhouse',
  room: 'Room',
};

const STATUS_BADGES = {
  rented: { label: 'Rented', className: 'bg-amber-500 text-white' },
  sold: { label: 'Sold', className: 'bg-red-500 text-white' },
  inactive: { label: 'Unavailable', className: 'bg-gray-500 text-white' },
};

export default function PropertyCard({ property, isSaved = false, onToggleSave }) {
  const imageUrl = property.primary_image || PLACEHOLDER_IMG;
  const typeLabel = TYPE_LABELS[property.property_type] || property.property_type;
  const statusBadge = STATUS_BADGES[property.status];

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative h-52 overflow-hidden">
        <Link to={`/properties/${property.id}`}>
          <img
            src={imageUrl}
            alt={property.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              statusBadge ? 'opacity-70' : ''
            }`}
          />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-800 shadow-sm">
            {typeLabel}
          </span>
          {statusBadge && (
            <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold shadow-sm ${statusBadge.className}`}>
              <Tag className="h-3 w-3" /> {statusBadge.label}
            </span>
          )}
        </div>
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(property.id);
            }}
            aria-label="Toggle save"
            className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-gray-900">
          {formatPrice(property.price)}
        </p>

        <p className="mt-2 line-clamp-1 text-sm font-medium text-gray-800">
          {property.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.city}, {property.state}
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-gray-400" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-gray-400" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-gray-400" /> {property.area_sqft} sqft
          </span>
        </div>
      </div>
    </div>
  );
}
