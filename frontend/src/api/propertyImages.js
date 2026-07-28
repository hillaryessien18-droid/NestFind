import apiClient from '@/api/client';

export const uploadPropertyImages = (propertyId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  return apiClient
    .post(`/properties/${propertyId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => response.data);
};

export const deletePropertyImage = (id) =>
  apiClient.delete(`/property-images/${id}/`).then((response) => response.data);
