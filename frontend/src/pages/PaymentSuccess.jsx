import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { XCircle, Loader2, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyPayment } from '@/api/payments';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const redirected = useRef(false);
  const callbackStatus = searchParams.get('status')?.toLowerCase();
  const txRef = searchParams.get('tx_ref') || sessionStorage.getItem('nestfind_pending_payment_tx_ref');

  const { data: result, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['payment-verify', txRef],
    queryFn: () => verifyPayment(txRef),
    enabled: !!txRef,
    retry: (failureCount, requestError) =>
      (!requestError.response || requestError.response.status === 503) && failureCount < 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    refetchInterval: (query) =>
      callbackStatus !== 'cancelled' && query.state.data?.status === 'pending' ? 3000 : false,
  });

  const cancelled = callbackStatus === 'cancelled' &&
    (!txRef || result?.status === 'pending' || result?.status === 'failed');

  useEffect(() => {
    if (cancelled) {
      sessionStorage.removeItem('nestfind_pending_payment_tx_ref');
    }
  }, [cancelled]);

  useEffect(() => {
    if (result?.status !== 'successful' || redirected.current) return;
    redirected.current = true;
    sessionStorage.removeItem('nestfind_pending_payment_tx_ref');
    queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    toast.success('Payment confirmed. View your booking in My Bookings.');
    navigate('/', { replace: true });
  }, [result, queryClient, navigate]);

  if (txRef && (isLoading || isFetching || result?.status === 'successful' || (result?.status === 'pending' && !cancelled))) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary-600" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Confirming Payment...</h1>
        <p className="mt-2 text-gray-500">Please wait while we confirm your payment with Flutterwave.</p>
      </div>
    );
  }

  const canRetry = !!txRef && !cancelled && !!error;
  const title = cancelled
    ? 'Payment Cancelled'
    : !txRef
      ? 'Payment Reference Missing'
      : error || !result
        ? 'Payment Verification Needs Attention'
        : 'Payment Not Successful';
  const message = cancelled
    ? 'No payment was confirmed.'
    : !txRef
      ? 'We could not find a transaction reference. Check your payment history or contact support if you were charged.'
      : error || !result
        ? 'We could not confirm your payment yet. Please retry before making another payment.'
        : 'Flutterwave did not confirm this payment. Please try again from the property page.';

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <XCircle className="h-16 w-16 text-amber-500" />
      <h1 className="mt-4 text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-md text-gray-500">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {canRetry && (
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Retry Verification
          </button>
        )}
        <Link
          to="/payment-history"
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Payment History
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
