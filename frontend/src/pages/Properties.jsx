import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getProperties } from '@/api/properties';
import PropertyCard from '@/components/properties/PropertyCard';
import { SkeletonList } from '@/components/ui/Skeleton';

const PROPERTY_TYPES = [
  { value: 'self_contain', label: 'Self-Contain' },
  { value: 'mini_flat', label: 'Mini Flat' },
  { value: 'flat', label: 'Flat' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'room', label: 'Room' },
];
const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-views_count', label: 'Most Popular' },
  { value: '-area_sqft', label: 'Largest' },
];

export default function Properties() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    is_furnished: searchParams.get('furnished') || '',
    ordering: searchParams.get('ordering') || '-created_at',
  });

  const [page, setPage] = useState(1);

  const buildQueryParams = () => {
    const params = { page };
    if (filters.search) params.search = filters.search;
    if (filters.property_type) params.property_type = filters.property_type;
    if (filters.city) params.city = filters.city;
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;
    if (filters.price_min) params.price__gte = filters.price_min;
    if (filters.price_max) params.price__lte = filters.price_max;
    if (filters.is_furnished) params.is_furnished = filters.is_furnished;
    if (filters.ordering) params.ordering = filters.ordering;
    return params;
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['properties', buildQueryParams()],
    queryFn: () => getProperties(buildQueryParams()),
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '', property_type: '', city: '', bedrooms: '',
      price_min: '', price_max: '', is_furnished: '', ordering: '-created_at',
    });
    setPage(1);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== 'ordering' && val !== ''
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Properties</h1>
        <p className="mt-1 text-gray-500">
          {data?.count || 0} properties available
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, city, or address..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <select
          value={filters.ordering}
          onChange={(e) => handleFilterChange('ordering', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] text-white">
              !
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Property Type</label>
              <select
                value={filters.property_type}
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Any city"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Furnished</label>
              <select
                value={filters.is_furnished}
                onChange={(e) => handleFilterChange('is_furnished', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Min Price</label>
              <input
                type="number"
                value={filters.price_min}
                onChange={(e) => handleFilterChange('price_min', e.target.value)}
                placeholder="₦0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Max Price</label>
              <input
                type="number"
                value={filters.price_max}
                onChange={(e) => handleFilterChange('price_max', e.target.value)}
                placeholder="No limit"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <SkeletonList count={6} />
      ) : data?.results?.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {data.count > 12 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 text-sm text-gray-500">
                Page {page} of {Math.ceil(data.count / 12)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-400">No properties found matching your criteria.</p>
          <button onClick={clearFilters} className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Clear filters
          </button>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          Updating...
        </div>
      )}
    </div>
  );
}
