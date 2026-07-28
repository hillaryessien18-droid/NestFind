import apiClient from '@/api/client';

export const getSavedListings = () =>
  apiClient.get('/properties/saved/').then((response) => response.data);

export const toggleSavedListing = (propertyId) =>
  apiClient.post(`/saved-listings/toggle/${propertyId}/`).then((response) => response.data);
