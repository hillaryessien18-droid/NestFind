import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Printer, ArrowLeft, CheckCircle, Home } from 'lucide-react';
import { getPaymentReceipt } from '@/api/payments';
import { formatNaira } from '@/utils/format';

export default function Receipt() {
  const { txRef } = useParams();

  const { data: receipt, isLoading, error } = useQuery({
    queryKey: ['payment-receipt', txRef],
    queryFn: () => getPaymentReceipt(txRef),
    enabled: !!txRef,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900">Receipt not found</h1>
        <p className="mt-2 text-gray-500">We could not find a receipt for this reference.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Home className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const rows = [
    ['Receipt No.', receipt.receipt_number],
    ['Payment Reference', receipt.tx_ref],
    ['Transaction ID', receipt.flw_ref || '—'],
    ['Payment Method', receipt.payment_method ? receipt.payment_method.replace(/_/g, ' ') : '—'],
  ];

  const detailRows = [
    ['Payer', `${receipt.payer_name} (${receipt.payer_email})`],
    ['Property', receipt.property_title],
    ['Location', receipt.property_address],
    [`${receipt.booking_type} Period`, `${new Date(receipt.period_start).toLocaleDateString()}${receipt.period_end ? ` - ${new Date(receipt.period_end).toLocaleDateString()}` : ''}`],
    ...(receipt.months ? [['Duration', `${receipt.months} month(s)`]] : []),
    ['Host', receipt.host_name],
    ['Date Paid', new Date(receipt.paid_at).toLocaleString()],
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      <div id="rent-receipt" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between bg-primary-600 p-6 text-white print:bg-white print:text-gray-900">
          <div>
            <p className="text-2xl font-bold">NestFind</p>
            <p className="mt-1 text-sm opacity-90">Rent Payment Receipt</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            receipt.status === 'Successful'
              ? 'bg-green-500/20 text-green-100 print:bg-green-50 print:text-green-700'
              : 'bg-red-500/20 text-red-100 print:bg-red-50 print:text-red-700'
          }`}>
            {receipt.status}
          </span>
        </div>

        <div className="border-b border-dashed border-gray-200 p-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-semibold text-gray-900">Payment received — thank you!</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
                <p className="break-all font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">Details</h2>
          <dl className="divide-y divide-gray-100 text-sm">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-gray-500">{label}</dt>
                <dd className="text-right font-medium text-gray-900">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-semibold text-gray-900">Total Paid</dt>
              <dd className="text-right text-lg font-bold text-primary-600">
                {formatNaira(receipt.amount)} {receipt.currency}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center text-xs text-gray-400 print:bg-white">
          This receipt was generated by NestFind. Keep it for your records.
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
        <Link
          to="/bookings"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          View My Bookings
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
