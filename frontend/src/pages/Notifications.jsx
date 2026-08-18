import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, CreditCard, Home, Loader2, CheckCheck, ChevronLeft } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/payments';

const TYPE_CONFIG = {
  welcome: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  payment: { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  booking: { icon: Home, color: 'text-primary-600', bg: 'bg-primary-50' },
  system: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = data?.results || data || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/properties" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No notifications</h3>
          <p className="mt-2 text-sm text-gray-500">You will see notifications about payments and bookings here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
            const TypeIcon = config.icon;

            return (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.is_read) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  notification.is_read
                    ? 'border-gray-200 bg-white'
                    : 'border-primary-200 bg-primary-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                    <TypeIcon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                          View Property
                        </Link>
                      )}
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
