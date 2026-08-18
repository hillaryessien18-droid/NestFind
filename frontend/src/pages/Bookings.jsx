import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Home, CheckCircle, Clock, XCircle, Loader2, ChevronLeft, Calendar } from 'lucide-react';
import { getBookings } from '@/api/payments';
import { formatNaira } from '@/utils/format';

const STATUS_CONFIG = {
  confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Confirmed' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  expired: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Expired' },
};

export default function Bookings() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
  });

  const bookings = data?.results || data || [];

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

      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Home className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No bookings yet</h3>
          <p className="mt-2 text-sm text-gray-500">Your bookings will appear here after you rent or purchase a property.</p>
          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Home className="h-4 w-4" /> Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <div key={booking.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  {booking.property_image ? (
                    <img
                      src={booking.property_image}
                      alt={booking.property_title}
                      className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <Home className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.property_title}</h3>
                        <p className="mt-0.5 text-sm text-gray-500">{booking.property_address}</p>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                        <StatusIcon className="h-3 w-3" /> {config.label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Home className="h-4 w-4 text-gray-400" />
                        {booking.booking_type_display}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(booking.start_date).toLocaleDateString()}
                        {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString()}`}
                      </span>
                      {booking.months && (
                        <span className="text-gray-500">{booking.months} month(s)</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">{formatNaira(booking.amount)}</span>
                      <Link
                        to={`/properties/${booking.property}`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        View Property
                      </Link>
                    </div>
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
