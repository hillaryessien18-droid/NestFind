import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createProperty, getAmenities } from '@/api/properties';
import { uploadPropertyImages } from '@/api/propertyImages';
import { Building2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  property_type: z.string().min(1, 'Property type is required'),
  price: z.number().min(1, 'Price is required'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(1),
  area_sqft: z.number().min(1, 'Area is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zip_code: z.string().optional(),
  is_furnished: z.boolean().default(false),
  max_guests: z.number().min(1).default(1),
  minimum_lease_months: z.number().min(1).default(12),
  amenity_ids: z.array(z.string()).default([]),
});

export default function CreateProperty() {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { bedrooms: 1, bathrooms: 1, is_furnished: false, max_guests: 1, minimum_lease_months: 12, country: 'Nigeria', state: 'Lagos', amenity_ids: [] },
  });

  const selectedAmenities = watch('amenity_ids') || [];

  const onSubmit = async (data) => {
    try {
      const property = await createProperty(data);

      if (imageFiles.length > 0) {
        await uploadPropertyImages(property.id, imageFiles);
      }

      toast.success('Property created successfully!');
      navigate(`/properties/${property.id}`);
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData ? Object.values(errorData).flat().join(', ') : 'Failed to create property';
      toast.error(msg);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">List a Property</h1>
        <p className="mt-1 text-gray-500">Fill in the details to create a new listing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input {...register('title')} className={inputClass} placeholder="Modern Downtown Apartment" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description')} rows={4} className={inputClass} placeholder="Describe your property..." />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select {...register('property_type')} className={inputClass}>
                  <option value="">Select type</option>
                  {['apartment', 'house', 'condo', 'studio', 'villa', 'townhouse', 'room'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                {errors.property_type && <p className="mt-1 text-xs text-red-500">{errors.property_type.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₦/month)</label>
                <input type="number" {...register('price', { valueAsNumber: true })} className={inputClass} placeholder="350000" />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input type="number" {...register('bedrooms', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input type="number" {...register('bathrooms', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Area (sqft)</label>
              <input type="number" {...register('area_sqft', { valueAsNumber: true })} className={inputClass} />
              {errors.area_sqft && <p className="mt-1 text-xs text-red-500">{errors.area_sqft.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Guests</label>
              <input type="number" {...register('max_guests', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Lease (months)</label>
              <input type="number" {...register('minimum_lease_months', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2.5">
                <input type="checkbox" {...register('is_furnished')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Furnished</span>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Location</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input {...register('address')} className={inputClass} placeholder="123 Main Street" />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input {...register('city')} className={inputClass} />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input {...register('state')} className={inputClass} />
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input {...register('country')} className={inputClass} />
              </div>
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input {...register('zip_code')} className={inputClass} />
            </div>
          </div>
        </div>

        {amenities?.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedAmenities.includes(amenity.id)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input type="checkbox" value={amenity.id} {...register('amenity_ids')} className="sr-only" />
                  {amenity.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Images</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles([...e.target.files])}
            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
          />
          {imageFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">{imageFiles.length} image(s) selected</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          {isSubmitting ? 'Creating...' : 'Create Property'}
        </button>
      </form>
    </div>
  );
}
