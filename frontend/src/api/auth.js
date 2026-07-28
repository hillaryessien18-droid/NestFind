import apiClient from '@/api/client';

export const registerUser = (payload) =>
  apiClient.post('/register/', payload).then((response) => response.data);

export const loginUser = (email, password) =>
  apiClient.post('/login/', { email, password }).then((response) => response.data);

export const logoutUser = (refresh) =>
  apiClient.post('/auth/logout/', { refresh }).then((response) => response.data);

export const getMe = () => apiClient.get('/me/').then((response) => response.data);

export const updateMe = (payload) =>
  apiClient.patch('/me/', payload).then((response) => response.data);

export const changePassword = (oldPassword, newPassword) =>
  apiClient
    .put('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    .then((response) => response.data);
