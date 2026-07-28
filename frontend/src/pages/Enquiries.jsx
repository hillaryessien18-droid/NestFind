import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { closeEnquiry, getEnquiries, respondToEnquiry } from '@/api/enquiries';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Enquiries() {
  const { isHost } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['enquiries'],
    queryFn: getEnquiries,
  });

  const respondMutation = useMutation({
    mutationFn: respondToEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries(['enquiries']);
      toast.success('Enquiry marked as responded');
    },
  });

  const closeMutation = useMutation({
    mutationFn: closeEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries(['enquiries']);
      toast.success('Enquiry closed');
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
        <p className="mt-1 text-gray-500">{data?.count || 0} enquiries</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : data?.results?.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((enquiry) => (
            <div key={enquiry.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {isHost ? `From: ${enquiry.sender_email}` : `Property: ${enquiry.property_title}`}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      enquiry.status === 'responded' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{enquiry.status}</span>
                  </div>
                  {isHost && (
                    <Link to={`/properties/${enquiry.property}`} className="mt-0.5 text-sm text-primary-600 hover:text-primary-700">
                      View Property
                    </Link>
                  )}
                  <p className="mt-2 text-sm text-gray-600">{enquiry.message}</p>
                  {enquiry.phone && (
                    <p className="mt-1 text-xs text-gray-400">Phone: {enquiry.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(enquiry.created_at).toLocaleString()}
                  </p>
                </div>

                {isHost && enquiry.status === 'pending' && (
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => respondMutation.mutate(enquiry.id)}
                      className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                      title="Mark as responded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => closeMutation.mutate(enquiry.id)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      title="Close enquiry"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-400">No enquiries yet.</p>
        </div>
      )}
    </div>
  );
}
