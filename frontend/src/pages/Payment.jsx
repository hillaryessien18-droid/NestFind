import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Calendar, CreditCard, Home, Clock, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProperty } from '@/api/properties';
import { initializePayment } from '@/api/payments';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatNaira } from '@/utils/format';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState('rent');

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      booking_type: 'rent',
      months: 12,
      start_date: new Date().toISOString().split('T')[0],
      full_name: (user?.first_name || user?.last_name)
        ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
        : user?.email || '',
      phone: user?.phone || '',
    },
  });

  const watchedMonths = watch('months') || 12;
  const watchedStartDate = watch('start_date');

  const calculateTotal = () => {
    if (!property) return 0;
    if (paymentType === 'purchase') return Number(property.price);
    return Number(property.price) * Number(watchedMonths);
  };

  const calculateEndDate = () => {
    if (!watchedStartDate || paymentType === 'purchase') return null;
    const start = new Date(watchedStartDate);
    start.setMonth(start.getMonth() + Number(watchedMonths));
    return start.toISOString().split('T')[0];
  };

  const paymentMutation = useMutation({
    mutationFn: initializePayment,
    onSuccess: (data) => {
      if (data.checkout_url) {
        toast.success('Redirecting to payment...');
        window.location.href = data.checkout_url;
      } else {
        toast.error('Failed to get payment link');
      }
    },
    onError: (err) => {
      console.error('Payment error:', err.response?.status, err.response?.data);
      const data = err.response?.data;
      let msg = 'Failed to initialize payment';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.error) msg = data.error;
        else if (data.details) msg = data.details;
        else if (data.detail) msg = data.detail;
        else {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            msg = `${firstKey}: ${data[firstKey][0]}`;
          }
        }
      }
      toast.error(msg);
    },
  });

  const onSubmit = (data) => {
    paymentMutation.mutate({
      property_id: id,
      booking_type: data.booking_type,
      months: data.booking_type === 'rent' ? Number(data.months) : undefined,
      start_date: data.start_date,
      full_name: data.full_name,
      phone: data.phone,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Property not found</h2>
        <Link to="/properties" className="mt-4 inline-block text-sm font-semibold text-primary-600">
          Browse Properties
        </Link>
      </div>
    );
  }

  if (property.status !== 'active') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">This property is no longer available</h2>
        <p className="mt-2 text-gray-500">
          Status: <span className="font-medium capitalize">{property.status}</span>
        </p>
        <Link to="/properties" className="mt-4 inline-block text-sm font-semibold text-primary-600">
          Browse Other Properties
        </Link>
      </div>
    );
  }

  const total = calculateTotal();
  const endDate = calculateEndDate();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to={`/properties/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Property
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Complete Your Payment</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Type</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('rent');
                    setValue('booking_type', 'rent');
                  }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    paymentType === 'rent'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className={`h-5 w-5 ${paymentType === 'rent' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">Rent Property</p>
                    <p className="text-xs text-gray-500">Pay monthly or upfront</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('purchase');
                    setValue('booking_type', 'purchase');
                  }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    paymentType === 'purchase'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentType === 'purchase' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">Purchase Property</p>
                    <p className="text-xs text-gray-500">One-time payment</p>
                  </div>
                </button>
              </div>
            </div>

            {paymentType === 'rent' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Rental Duration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Number of Months</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={property.minimum_lease_months || 1}
                        max={60}
                        {...register('months', {
                          required: 'Months is required',
                          min: { value: property.minimum_lease_months || 1, message: `Minimum ${property.minimum_lease_months || 1} months` },
                        })}
                        className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-500">
                        (min. {property.minimum_lease_months || 1} months)
                      </span>
                    </div>
                    {errors.months && <p className="mt-1 text-xs text-red-500">{errors.months.message}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatPrice(property.price)}/month x {watchedMonths} months = <span className="font-semibold text-gray-900">{formatNaira(total)}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Move-in Date</h2>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    {...register('full_name', { required: 'Full name is required' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </div>
              </div>
            </div>

            <input type="hidden" {...register('booking_type', { required: true })} />

            <button
              type="submit"
              disabled={paymentMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {paymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay {formatNaira(total)}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  {property.images?.[0]?.image ? (
                    <img src={property.images[0].image} alt={property.title} className="h-20 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{property.title}</p>
                    <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium capitalize">{paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Price</span>
                    <span className="font-medium">{formatPrice(property.price)}</span>
                  </div>
                  {paymentType === 'rent' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{watchedMonths} months</span>
                    </div>
                  )}
                  {paymentType === 'rent' && endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Date</span>
                      <span className="font-medium">{new Date(endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <hr className="border-gray-100" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-primary-600">{formatNaira(total)}</span>
                  </div>
                </div>
              </div>
            </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-semibold">Secure Payment</p>
              <p className="mt-1">Payment is processed securely via Flutterwave. You will be redirected to complete the payment.</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
