import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Home, ArrowRight, ReceiptText } from 'lucide-react';
import { verifyPayment, getTenantDetails } from '@/api/payments';
import TenantDetailsForm from '@/components/ui/TenantDetailsForm';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const txRef = searchParams.get('tx_ref');

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['payment-verify', txRef],
    queryFn: () => verifyPayment(txRef),
    enabled: !!txRef,
    retry: false,
  });

  useEffect(() => {
    if (result) {
      queryClient.invalidateQueries(['payment-history']);
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['notifications']);
    }
  }, [result, queryClient]);

  const isSuccessful = result?.status === 'successful';
  const bookingId = result?.booking_id;

  const detailsQuery = useQuery({
    queryKey: ['tenant-details', bookingId],
    queryFn: () => getTenantDetails(bookingId),
    enabled: isSuccessful && !!bookingId,
    retry: false,
  });
  const hasDetails = !!detailsQuery.data;

  if (!txRef) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Invalid Payment Link</h1>
        <p className="mt-2 text-gray-500">No transaction reference found.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Home className="h-4 w-4" /> Go Home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary-600" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Verifying Payment...</h1>
        <p className="mt-2 text-gray-500">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Verification Failed</h1>
        <p className="mt-2 text-gray-500">
          {error?.response?.data?.error || 'Could not verify your payment. Please contact support.'}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/payment-history"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            View Payment History
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {isSuccessful ? (
        <>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="mt-2 max-w-md text-center text-gray-500">
              Your payment has been confirmed. A welcome message has been sent to your email and inbox.
              Thank you for choosing NestFind!
            </p>
          </div>

          <div className="mt-8">
            <TenantDetailsForm bookingId={bookingId} onDone={() => detailsQuery.refetch()} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/receipt/${txRef}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <ReceiptText className="h-4 w-4" /> View Receipt
            </Link>
            {hasDetails && (
              <Link
                to="/bookings"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
              >
                View My Bookings <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment Not Successful</h1>
          <p className="mt-2 max-w-md text-center text-gray-500">
            Your payment could not be confirmed. Please try again or contact support.
          </p>
        </>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {!isSuccessful && result.booking_id && (
          <Link
            to="/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            View My Bookings <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {isSuccessful && (
          <Link
            to="/payment-history"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Payment History
          </Link>
        )}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Home className="h-4 w-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
