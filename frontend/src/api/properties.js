import apiClient from '@/api/client';

export const getProperties = (params) =>
  apiClient.get('/properties/', { params }).then((response) => response.data);

export const getProperty = (id) =>
  apiClient.get(`/properties/${id}/`).then((response) => response.data);

export const getFeaturedProperties = () =>
  apiClient.get('/properties/featured/').then((response) => response.data);

export const getSimilarProperties = (id) =>
  apiClient.get(`/properties/${id}/similar/`).then((response) => response.data);

export const getMyProperties = (params) =>
  apiClient.get('/properties/my_properties/', { params }).then((response) => response.data);

export const createProperty = (payload) =>
  apiClient.post('/properties/', payload).then((response) => response.data);

export const updateProperty = (id, payload) =>
  apiClient.patch(`/properties/${id}/`, payload).then((response) => response.data);

export const deleteProperty = (id) =>
  apiClient.delete(`/properties/${id}/`).then((response) => response.data);

export const getAmenities = () =>
  apiClient.get('/amenities/').then((response) => response.data);

export const getPropertyReviews = (propertyId) =>
  apiClient.get(`/properties/${propertyId}/reviews/`).then((response) => response.data);
