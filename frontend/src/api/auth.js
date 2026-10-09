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

export const sendPhoneVerificationCode = () =>
  apiClient.post('/auth/phone/send-code/').then((response) => response.data);

export const verifyPhoneNumber = (code) =>
  apiClient.post('/auth/phone/verify/', { code }).then((response) => response.data);

export const sendEmailVerificationCode = () =>
  apiClient.post('/auth/email/send-code/').then((response) => response.data);

export const verifyEmailAddress = (code) =>
  apiClient.post('/auth/email/verify/', { code }).then((response) => response.data);

export const requestPasswordReset = (email) =>
  apiClient.post('/auth/password-reset/request/', { email }).then((response) => response.data);

export const confirmPasswordReset = (uid, token, newPassword) =>
  apiClient.post('/auth/password-reset/confirm/', {
    uid, token, new_password: newPassword,
  }).then((response) => response.data);
