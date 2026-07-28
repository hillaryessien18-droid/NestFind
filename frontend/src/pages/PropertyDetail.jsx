import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import useEmblaCarousel from 'embla-carousel-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, BedDouble, Bath, Maximize, Heart, Star, Send, ChevronLeft, ChevronRight, Users, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEnquiry } from '@/api/enquiries';
import { getProperty, getPropertyReviews, getSimilarProperties } from '@/api/properties';
import { toggleSavedListing } from '@/api/savedListings';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import PropertyCard from '@/components/properties/PropertyCard';
import { formatPrice } from '@/utils/format';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1643297551340-19d8ad4f20ad?w=800&h=600&fit=crop';

export default function PropertyDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [currentImage, setCurrentImage] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getPropertyReviews(id),
    enabled: !!id,
  });

  const { data: similarProperties } = useQuery({
    queryKey: ['similar-properties', id],
    queryFn: () => getSimilarProperties(id),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: () => toggleSavedListing(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['property', id]);
      queryClient.invalidateQueries(['saved-properties']);
      toast.success(data.message);
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return undefined;

    const onSelect = () => setCurrentImage(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const onEnquirySubmit = async (data) => {
    try {
      await createEnquiry({ property: id, ...data });
      toast.success('Enquiry sent successfully!');
      setShowEnquiry(false);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send enquiry');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SkeletonDetail />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Property not found</h2>
        <Link to="/properties" className="mt-4 inline-block text-sm font-semibold text-primary-600">
          Browse Properties
        </Link>
      </div>
    );
  }

  const images = property.images?.length > 0
    ? property.images.map((img) => img.image)
    : [PLACEHOLDER_IMG];

  const isOwner = user?.id === property.user;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/properties" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Properties
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {images.map((image, index) => (
                  <div key={image} className="min-w-0 flex-[0_0_100%]">
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[480px]"
                    />
                  </div>
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTo(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {property.address}, {property.city}, {property.state}, {property.country}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(property.price)}
                </span>
                <span className="text-gray-400">month</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              {[
                { icon: BedDouble, text: `${property.bedrooms} Bedrooms` },
                { icon: Bath, text: `${property.bathrooms} Bathrooms` },
                { icon: Maximize, text: `${property.area_sqft} sqft` },
                { icon: Home, text: property.property_type },
                { icon: Users, text: `Max ${property.max_guests} guests` },
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
                  <item.icon className="h-4 w-4" />
                  {item.text}
                </span>
              ))}
            </div>

            {property.average_rating > 0 && (
              <div className="mt-3 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{property.average_rating}</span>
                <span className="text-sm text-gray-400">({property.review_count} reviews)</span>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-2 leading-relaxed text-gray-600">{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span key={amenity.id} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.latitude && property.longitude && (
              <div className="mt-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Location</h2>
                <div className="h-64 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <MapContainer
                    center={[Number(property.latitude), Number(property.longitude)]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[Number(property.latitude), Number(property.longitude)]}
                      radius={9}
                      pathOptions={{ color: '#0284c7', fillColor: '#0ea5e9', fillOpacity: 0.8 }}
                    >
                      <Popup>{property.title}</Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Reviews ({reviews?.length || 0})
              </h2>
              {reviews?.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{review.user_name}</p>
                          <div className="mt-0.5 flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(property.price)}
              </span>
              <span className="text-gray-400">month</span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Available from</span>
                <span className="font-medium">
                  {property.available_from
                    ? new Date(property.available_from).toLocaleDateString()
                    : 'Immediately'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min. lease</span>
                <span className="font-medium">{property.minimum_lease_months} months</span>
              </div>
              <div className="flex justify-between">
                <span>Furnished</span>
                <span className="font-medium">{property.is_furnished ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Views</span>
                <span className="font-medium">{property.views_count}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {isAuthenticated && !isOwner && (
                <>
                  <button
                    onClick={() => setShowEnquiry(!showEnquiry)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <Send className="h-4 w-4" /> Send Enquiry
                  </button>
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <Heart className={`h-4 w-4 ${property.is_saved ? 'fill-red-500 text-red-500' : ''}`} />
                    {property.is_saved ? 'Saved' : 'Save Property'}
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Sign in to Enquire
                </Link>
              )}
              {isOwner && (
                <Link
                  to={`/properties/${id}/edit`}
                  className="flex w-full items-center justify-center rounded-xl border border-primary-300 bg-primary-50 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
                >
                  Edit Property
                </Link>
              )}
            </div>

            {showEnquiry && (
              <form onSubmit={handleSubmit(onEnquirySubmit)} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  placeholder="I'm interested in this property..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                <input
                  {...register('phone')}
                  placeholder="Phone number (optional)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {similarProperties?.length > 0 && (
        <section className="mt-10 border-t border-gray-100 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Similar Listings</h2>
            <Link to="/properties" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProperties.slice(0, 4).map((similar) => (
              <PropertyCard key={similar.id} property={similar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
