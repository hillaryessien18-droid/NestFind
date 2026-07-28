import apiClient from '@/api/client';

export const getEnquiries = () =>
  apiClient.get('/enquiries/').then((response) => response.data);

export const createEnquiry = (payload) =>
  apiClient.post('/enquiries/', payload).then((response) => response.data);

export const respondToEnquiry = (id) =>
  apiClient.post(`/enquiries/${id}/respond/`).then((response) => response.data);

export const closeEnquiry = (id) =>
  apiClient.post(`/enquiries/${id}/close/`).then((response) => response.data);
