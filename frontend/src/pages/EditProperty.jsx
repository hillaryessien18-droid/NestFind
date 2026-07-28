import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAmenities, getProperty, updateProperty } from '@/api/properties';
import { uploadPropertyImages } from '@/api/propertyImages';
import { Save } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  property_type: z.string().min(1, 'Property type is required'),
  status: z.string(),
  price: z.number().min(1, 'Price is required'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(1),
  area_sqft: z.number().min(1, 'Area is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zip_code: z.string().optional(),
  is_furnished: z.boolean(),
  max_guests: z.number().min(1),
  minimum_lease_months: z.number().min(1),
  amenity_ids: z.array(z.string()).default([]),
});

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);

  const { data: property, isLoading: loadingProperty } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  });

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (property) {
      reset({
        ...property,
        amenity_ids: property.amenities?.map((a) => a.id) || [],
      });
    }
  }, [property, reset]);

  const selectedAmenities = watch('amenity_ids') || [];

  const onSubmit = async (data) => {
    try {
      await updateProperty(id, data);

      if (imageFiles.length > 0) {
        await uploadPropertyImages(id, imageFiles);
      }

      toast.success('Property updated!');
      navigate(`/properties/${id}`);
    } catch {
      toast.error('Failed to update property');
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
        <p className="mt-1 text-gray-500">Update your listing details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input {...register('title')} className={inputClass} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description')} rows={4} className={inputClass} />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select {...register('property_type')} className={inputClass}>
                  {['apartment', 'house', 'condo', 'studio', 'villa', 'townhouse', 'room'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select {...register('status')} className={inputClass}>
                  {['draft', 'active', 'inactive', 'sold'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₦/month)</label>
                <input type="number" {...register('price', { valueAsNumber: true })} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Details</h2>
          <div className="grid gap-4 sm:grid-cols-3">
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
              <input {...register('address')} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input {...register('city')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input {...register('state')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input {...register('country')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP</label>
                <input {...register('zip_code')} className={inputClass} />
              </div>
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
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Add More Images</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles([...e.target.files])}
            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
          />
          {property?.images?.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-sm font-medium text-gray-700">Current images:</p>
              <div className="flex flex-wrap gap-2">
                {property.images.map((img) => (
                  <img key={img.id} src={img.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            </div>
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
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
