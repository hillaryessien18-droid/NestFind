import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight, Building2, MessageSquare, Heart, Star } from 'lucide-react';
import { getFeaturedProperties, getCommunityReviews, getPropertyLocations } from '@/api/properties';
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

const RENTAL_CATEGORIES = [
  { label: 'Self-Contain', description: 'Private room, bath and kitchenette', to: '/properties?type=self_contain' },
  { label: 'Mini Flats', description: 'Separate bedroom and sitting room', to: '/properties?type=mini_flat' },
  { label: '1 Bedroom', description: 'Compact homes for individuals and couples', to: '/properties?bedrooms=1' },
  { label: '2 Bedrooms', description: 'Practical apartments for small families', to: '/properties?bedrooms=2' },
  { label: '3 Bedrooms', description: 'Spacious flats and family houses', to: '/properties?bedrooms=3' },
];

const POPULAR_LOCATIONS = [
  { label: 'Lagos', search: 'Lagos' },
  { label: 'Abuja', search: 'Abuja' },
  { label: 'Port Harcourt', search: 'Port Harcourt' },
  { label: 'Akwa Ibom', search: 'Akwa Ibom' },
  { label: 'Ibadan', search: 'Ibadan' },
  { label: 'Enugu', search: 'Enugu' },
  { label: 'Benin City', search: 'Benin City' },
  { label: 'Kaduna', search: 'Kaduna' },
];

const RENTAL_JOURNEY = [
  { number: '01', title: 'Discover', description: 'Explore homes by location, budget and the space you need.', icon: Search },
  { number: '02', title: 'Connect', description: 'Ask questions and make enquiries about the places you love.', icon: MessageSquare },
  { number: '03', title: 'Feel at home', description: 'Save your favourites and keep your rental journey in one place.', icon: Heart },
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
  const { data: propertyLocations } = useQuery({
    queryKey: ['property-locations'],
    queryFn: getPropertyLocations,
  });
  const { data: communityReviews } = useQuery({
    queryKey: ['community-reviews'],
    queryFn: getCommunityReviews,
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
          <picture className="block h-full w-full">
            <source srcSet="/nestfind-classic-hero.webp" type="image/webp" />
            <img
              src={HERO_IMG}
              alt="Elegant residential home framed by palms at sunset"
              className="h-full w-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />
        </div>

        <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 sm:text-sm">
            A more thoughtful way to find home
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your <span className="text-primary-300">Perfect Nest</span> in Nigeria
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-200 sm:text-xl">
            Browse self-contains, mini flats, apartments and houses across Nigeria with verified hosts and prices in Naira.
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
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All cities / areas</option>
                  {(propertyLocations?.length ? propertyLocations : POPULAR_LOCATIONS.map((location) => location.search)).map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
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

      <section className="bg-[#f7f3eb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 border-b border-[#d8cfbd] pb-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#987541]">The NestFind experience</p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight text-[#21312a] sm:text-4xl">
                Find a place that feels like yours.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#5b625b] lg:pb-1">
              From the first search to the first conversation, explore rental homes across Nigeria with a simpler path to your next chapter.
            </p>
          </div>
          <div className="grid gap-8 pt-10 md:grid-cols-3">
            {RENTAL_JOURNEY.map(({ number, title, description, icon: Icon }) => (
              <div key={number} className="border-l border-[#cbbf9f] pl-6">
                <div className="flex items-center justify-between text-[#987541]">
                  <span className="font-serif text-lg">{number}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-[#21312a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5b625b]">{description}</p>
              </div>
            ))}
          </div>
          <Link to="/properties" className="mt-10 inline-flex items-center gap-2 border-b border-[#987541] pb-1 text-sm font-semibold text-[#21312a] transition hover:text-[#987541]">
            Explore homes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-b border-[#ded4c2] bg-[#f7f3eb] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#987541]">Find your space</p>
            <h2 className="mt-3 font-serif text-3xl text-[#21312a] sm:text-4xl">Browse by home type</h2>
            <p className="mt-2 text-[#5b625b]">Find the Nigerian rental category that fits your needs.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {RENTAL_CATEGORIES.map((category) => (
              <Link key={category.label} to={category.to} className="group flex min-h-52 flex-col rounded-xl border border-[#ded4c2] bg-[#fffdf8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b89b6b] hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <Building2 className="h-6 w-6 text-[#987541]" />
                  <ArrowRight className="h-4 w-4 text-[#987541] transition group-hover:translate-x-1" />
                </div>
                <div className="mt-auto pt-8">
                  <h3 className="font-serif text-xl text-[#21312a]">{category.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5b625b]">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3eb] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7">
            <h2 className="font-serif text-3xl text-[#21312a]">Popular locations in Nigeria</h2>
            <p className="mt-2 text-[#5b625b]">Explore rentals in leading cities and state capitals.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {POPULAR_LOCATIONS.map((location) => (
              <Link key={location.label} to={`/properties?search=${encodeURIComponent(location.search)}`} className="rounded-full border border-[#ded4c2] bg-[#fffdf8] px-5 py-2.5 text-sm font-semibold text-[#21312a] shadow-sm transition hover:border-[#b89b6b] hover:text-[#987541]">
                {location.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl bg-[#f7f3eb] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl text-[#21312a]">Featured Properties</h2>
            <p className="mt-2 text-[#5b625b]">Handpicked homes across Nigeria just for you</p>
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

      <section className="border-t border-[#ded4c2] bg-[#f7f3eb] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#987541]">From our community</p>
          <h2 className="mt-3 font-serif text-3xl text-[#21312a] sm:text-4xl">
            {communityReviews?.length > 0 ? 'Real experiences, shared by renters' : 'Reviews from our community'}
          </h2>
          {communityReviews?.length > 0 ? (
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {communityReviews.map((review) => (
                <article key={review.id} className="flex flex-col rounded-xl border border-[#ded4c2] bg-[#fffdf8] p-6">
                  <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-[#b48a4a] text-[#b48a4a]' : 'text-[#ded4c2]'}`} aria-hidden="true" />
                    ))}
                  </div>
                  <p className="mt-5 flex-1 font-serif text-lg leading-7 text-[#21312a]">“{review.comment}”</p>
                  <div className="mt-6 border-t border-[#ded4c2] pt-4">
                    <p className="text-sm font-semibold text-[#21312a]">{review.user_name}</p>
                    <Link to={`/properties/${review.property}`} className="mt-1 block text-xs text-[#987541] hover:underline">
                      {review.property_title}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 max-w-2xl text-[#5b625b]">Customer reviews will appear here as NestFind renters share their experiences.</p>
          )}
        </div>
      </section>

      <section className="bg-[#f7f3eb] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl text-[#21312a]">Ready to List Your Property?</h2>
          <p className="mt-2 text-[#5b625b]">Join thousands of hosts on NestFind</p>
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
