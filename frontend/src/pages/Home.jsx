import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight } from 'lucide-react';
import { getFeaturedProperties } from '@/api/properties';
import PropertyCard from '@/components/properties/PropertyCard';
import { SkeletonList } from '@/components/ui/Skeleton';

const HERO_IMG = 'https://images.unsplash.com/photo-1640475169249-2df3c29a1bba?w=1920&h=1080&fit=crop';

const PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: '200000', label: '₦200,000/mo and under' },
  { value: '500000', label: '₦500,000/mo and under' },
  { value: '1000000', label: '₦1,000,000/mo and under' },
  { value: '2000000', label: '₦2,000,000/mo and under' },
];

const BED_OPTIONS = [
  { value: '', label: 'Any beds' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [searchBeds, setSearchBeds] = useState('');

  const { data: featured, isLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedProperties,
  });

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.set('city', searchCity.trim());
    if (searchPrice) params.set('price_max', searchPrice);
    if (searchBeds) params.set('bedrooms', searchBeds);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Lagos city skyline"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />
        </div>

        <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your <span className="text-primary-300">Perfect Nest</span> in Lagos
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-200 sm:text-xl">
            Browse apartments, houses and condos across Lagos with verified hosts and prices in Naira.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-10 w-full max-w-4xl rounded-xl bg-white p-3 shadow-2xl sm:p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col text-left">
                <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  City / Area
                </label>
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Lekki, Ikeja, Ikoyi..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex flex-col text-left">
                <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Max Price
                </label>
                <select
                  value={searchPrice}
                  onChange={(e) => setSearchPrice(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {PRICE_RANGES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-left">
                <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Bedrooms
                </label>
                <select
                  value={searchBeds}
                  onChange={(e) => setSearchBeds(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {BED_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Search className="h-4 w-4" /> Search
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-50"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
            <p className="mt-1 text-gray-500">Handpicked homes in Lagos just for you</p>
          </div>
          <Link to="/properties" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all &rarr;
          </Link>
        </div>

        {isLoading ? (
          <SkeletonList count={6} />
        ) : featured?.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400">No featured properties yet.</p>
        )}
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ready to List Your Property?</h2>
          <p className="mt-2 text-gray-500">Join thousands of hosts on NestFind</p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Become a Host <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
