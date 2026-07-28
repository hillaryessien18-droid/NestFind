import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSavedListings, toggleSavedListing } from '@/api/savedListings';
import PropertyCard from '@/components/properties/PropertyCard';
import { SkeletonList } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';

export default function SavedProperties() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-properties'],
    queryFn: getSavedListings,
  });

  const saveMutation = useMutation({
    mutationFn: toggleSavedListing,
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-properties']);
      toast.success('Property removed from saved');
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
        <p className="mt-1 text-gray-500">{data?.count || 0} saved</p>
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : data?.results?.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={true}
              onToggleSave={() => saveMutation.mutate(property.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-400">No saved properties yet.</p>
          <Link to="/properties" className="mt-3 inline-block text-sm font-semibold text-primary-600">
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
}
