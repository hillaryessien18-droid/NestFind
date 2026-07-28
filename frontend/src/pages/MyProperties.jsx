import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteProperty, getMyProperties } from '@/api/properties';
import { SkeletonList } from '@/components/ui/Skeleton';
import { formatPrice } from '@/utils/format';

export default function MyProperties() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-properties', page],
    queryFn: () => getMyProperties({ page }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-properties']);
      toast.success('Property deleted');
    },
    onError: () => toast.error('Failed to delete property'),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="mt-1 text-gray-500">{data?.count || 0} properties listed</p>
        </div>
        <Link
          to="/properties/create"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <PlusCircle className="h-4 w-4" /> Add Property
        </Link>
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : data?.results?.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((property) => (
            <div key={property.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <img
                src={property.primary_image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120&h=90&fit=crop'}
                alt={property.title}
                className="h-20 w-24 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold text-gray-900">{property.title}</h3>
                <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className={`rounded-full px-2 py-0.5 ${
                    property.status === 'active' ? 'bg-green-100 text-green-700' :
                    property.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{property.status}</span>
                  <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {property.views_count}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{formatPrice(property.price)}</p>
                <div className="mt-2 flex gap-2">
                  <Link
                    to={`/properties/${property.id}/edit`}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this property?')) {
                        deleteMutation.mutate(property.id);
                      }
                    }}
                    className="rounded-lg border border-gray-200 p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {data.count > 12 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-400">You haven't listed any properties yet.</p>
          <Link to="/properties/create" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            <PlusCircle className="h-4 w-4" /> List your first property
          </Link>
        </div>
      )}
    </div>
  );
}
