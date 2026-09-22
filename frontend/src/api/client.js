import axios from 'axios';

const PRODUCTION_API_URL = 'https://nestfind-backend-ie6m.onrender.com/api';
const configuredApiURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;
const apiBaseURL = configuredApiURL || (import.meta.env.PROD ? PRODUCTION_API_URL : '/api');

const apiClient = axios.create({
  baseURL: apiBaseURL.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      typeof error.response?.data === 'string'
      && error.response.data.trimStart().startsWith('<')
    ) {
      error.response.data = {
        detail: 'The server rejected the request. Please try again shortly.',
      };
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${apiClient.defaults.baseURL}/refresh/`,
            { refresh: refreshToken }
          );
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
