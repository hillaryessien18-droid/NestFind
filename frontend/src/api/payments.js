import apiClient from './client';

export const initializePayment = (data) =>
  apiClient.post('/payments/initialize/', data).then((res) => res.data);

export const verifyPayment = (txRef) =>
  apiClient.get(`/payments/verify/${txRef}/`).then((res) => res.data);

export const getPaymentHistory = (params) =>
  apiClient.get('/payments/history/', { params }).then((res) => res.data);

export const getBookings = (params) =>
  apiClient.get('/bookings/', { params }).then((res) => res.data);

export const getBooking = (id) =>
  apiClient.get(`/bookings/${id}/`).then((res) => res.data);

export const getNotifications = (params) =>
  apiClient.get('/notifications/', { params }).then((res) => res.data);

export const getUnreadNotificationCount = () =>
  apiClient.get('/notifications/unread-count/').then((res) => res.data);

export const markNotificationRead = (id) =>
  apiClient.patch(`/notifications/${id}/read/`).then((res) => res.data);

export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/read-all/').then((res) => res.data);
