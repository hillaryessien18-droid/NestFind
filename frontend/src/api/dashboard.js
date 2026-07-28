import apiClient from '@/api/client';

export const getHostDashboard = () =>
  apiClient.get('/dashboard/').then((response) => response.data);

export const getPlatformStats = () =>
  apiClient.get('/stats/').then((response) => response.data);
