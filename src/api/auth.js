import client from './client';

export const authApi = {
  register: (payload) => client.post('/auth/register/', payload),
  login: (payload) => client.post('/auth/login/', payload),
  refresh: (refresh) => client.post('/auth/refresh/', { refresh }),
  logout: (refresh) => client.post('/auth/logout/', { refresh }),
  verifyEmail: (payload) => client.post('/auth/verify-email/', payload),
  verifyOtp: (payload) => client.post('/auth/verify-otp/', payload),
  resendOtp: (payload) => client.post('/auth/resend-otp/', payload),
  forgotPassword: (payload) => client.post('/auth/forgot-password/', payload),
  resetPassword: (payload) => client.post('/auth/reset-password/', payload),
  changePassword: (payload) => client.post('/auth/change-password/', payload),
  googleLogin: (payload) => client.post('/auth/google/', payload),
};
