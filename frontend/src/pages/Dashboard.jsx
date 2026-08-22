import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, MessageSquare, Home, Star, ReceiptText, Wallet, CalendarCheck, Loader2 } from 'lucide-react';
import { getHostDashboard } from '@/api/dashboard';
import { getBookings } from '@/api/payments';
import { useAuth } from '@/hooks/useAuth';
import { formatNaira } from '@/utils/format';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function HostDashboard({ dashboard }) {
  const { summary, views_by_property, enquiries_by_status, recent_enquiries } = dashboard;

  const statusData = Object.entries(enquiries_by_status || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { icon: Home, label: 'Total Properties', value: summary.total_properties, color: 'bg-primary-50 text-primary-600' },
          { icon: Eye, label: 'Total Views', value: summary.total_views, color: 'bg-emerald-50 text-emerald-600' },
          { icon: MessageSquare, label: 'Total Enquiries', value: summary.total_enquiries, color: 'bg-amber-50 text-amber-600' },
          { icon: Star, label: 'Avg Rating', value: summary.average_rating?.toFixed(1) || '0.0', color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Views by Property</h2>
          {views_by_property?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={views_by_property}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-gray-400">No property data yet</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Enquiries by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-gray-400">No enquiries yet</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Enquiries</h2>
          <Link to="/enquiries" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        {recent_enquiries?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recent_enquiries.map((enquiry) => (
              <div key={enquiry.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{enquiry.property}</p>
                  <p className="text-xs text-gray-500 truncate">{enquiry.message}</p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    enquiry.status === 'responded' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{enquiry.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-400">No enquiries yet</p>
        )}
      </div>
    </>
  );
}

function TenantDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const bookings = data?.results || data || [];
  const paidBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalPaid = paidBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const stats = [
    { icon: CalendarCheck, label: 'Active Rentals', value: paidBookings.length, color: 'bg-emerald-50 text-emerald-600' },
    { icon: Home, label: 'Total Bookings', value: bookings.length, color: 'bg-primary-50 text-primary-600' },
    { icon: Wallet, label: 'Total Paid', value: formatNaira(totalPaid), color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ReceiptText className="h-5 w-5 text-primary-600" /> Rent Payments & Receipts
          </h2>
          <Link to="/payment-history" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Payment history
          </Link>
        </div>

        {paidBookings.length === 0 ? (
          <div className="py-10 text-center">
            <ReceiptText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No rent payments yet.</p>
            <Link
              to="/properties"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paidBookings.map((booking) => (
              <div key={booking.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{booking.property_title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Paid on {new Date(booking.updated_at).toLocaleDateString()}
                    {booking.months ? ` • ${booking.months} month(s)` : ''}
                    {booking.receipt_tx_ref ? ` • Ref ${booking.receipt_tx_ref}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:shrink-0">
                  <span className="font-bold text-gray-900">{formatNaira(booking.amount)}</span>
                  {booking.receipt_tx_ref && (
                    <Link
                      to={`/receipt/${booking.receipt_tx_ref}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                    >
                      <ReceiptText className="h-3.5 w-3.5" /> View Receipt
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isTenantView = user?.role !== 'host';

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getHostDashboard,
    enabled: !isTenantView,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isTenantView ? 'My Dashboard' : 'Host Dashboard'}
        </h1>
        <p className="mt-1 text-gray-500">
          {isTenantView ? 'Your rentals, payments and receipts' : 'Overview of your properties and activity'}
        </p>
      </div>

      {isTenantView ? (
        <TenantDashboard />
      ) : dashboard ? (
        <HostDashboard dashboard={dashboard} />
      ) : null}
    </div>
  );
}
