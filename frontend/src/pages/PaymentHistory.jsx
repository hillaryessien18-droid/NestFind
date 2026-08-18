import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Clock, Home, Loader2, ChevronLeft } from 'lucide-react';
import { getPaymentHistory } from '@/api/payments';
import { formatNaira } from '@/utils/format';

const STATUS_CONFIG = {
  successful: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Successful' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
};

export default function PaymentHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => getPaymentHistory(),
  });

  const transactions = data?.results || data || [];

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/properties" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Payment History</h1>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No payments yet</h3>
          <p className="mt-2 text-sm text-gray-500">Your payment transactions will appear here.</p>
          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Home className="h-4 w-4" /> Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const config = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <div key={tx.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Transaction</p>
                      <p className="mt-0.5 text-sm text-gray-500">Ref: {tx.tx_ref}</p>
                      {tx.flw_ref && (
                        <p className="mt-0.5 text-xs text-gray-400">FW Ref: {tx.flw_ref}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {tx.payment_method && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {tx.payment_method}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatNaira(tx.amount)}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
