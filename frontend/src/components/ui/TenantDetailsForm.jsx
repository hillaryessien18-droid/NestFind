import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { CheckCircle2, ClipboardList, Loader2 } from 'lucide-react';
import { submitTenantDetails } from '@/api/payments';

const schema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  current_address: z.string().min(5, 'Address is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  next_of_kin_name: z.string().min(2, "Next of kin's name is required"),
  next_of_kin_phone: z.string().min(7, 'Enter a valid phone number'),
  id_number: z.string().optional(),
  notes: z.string().optional(),
});

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

export default function TenantDetailsForm({ bookingId, onDone }) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', current_address: '', occupation: '', next_of_kin_name: '', next_of_kin_phone: '', id_number: '', notes: '' },
  });

  const onSubmit = async (values) => {
    try {
      await submitTenantDetails(bookingId, values);
      setSubmitted(true);
      toast.success('Move-in details submitted!');
      onDone?.();
    } catch (err) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0];
      toast.error(msg || 'Could not submit your details. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <h3 className="mt-3 font-semibold text-gray-900">Move-in details received</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your information has been saved to this booking. Your host now has everything needed to welcome you.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Complete your move-in details</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Please fill out this short form so we can finalize your tenancy records.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input {...register('phone')} className={inputClass} placeholder="e.g. 08012345678" />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Occupation *</label>
            <input {...register('occupation')} className={inputClass} placeholder="e.g. Software Engineer" />
            {errors.occupation && <p className="mt-1 text-xs text-red-500">{errors.occupation.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Address *</label>
          <textarea {...register('current_address')} rows={2} className={inputClass} placeholder="Where do you currently live?" />
          {errors.current_address && <p className="mt-1 text-xs text-red-500">{errors.current_address.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Next of Kin Name *</label>
            <input {...register('next_of_kin_name')} className={inputClass} placeholder="Full name" />
            {errors.next_of_kin_name && <p className="mt-1 text-xs text-red-500">{errors.next_of_kin_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Next of Kin Phone *</label>
            <input {...register('next_of_kin_phone')} className={inputClass} placeholder="e.g. 08123456789" />
            {errors.next_of_kin_phone && <p className="mt-1 text-xs text-red-500">{errors.next_of_kin_phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ID Number (NIN / Voter's Card)</label>
          <input {...register('id_number')} className={inputClass} placeholder="Optional" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
          <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Anything else we should know? (Optional)" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Submitting...' : 'Submit Details'}
        </button>
      </form>
    </div>
  );
}
