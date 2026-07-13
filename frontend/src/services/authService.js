import api from '../api/axios'

export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),

  register: (data) => api.post('/api/auth/register', data),

  getMe: () => api.get('/api/auth/me'),

  forgotPassword: (email) => api.post('/api/auth/forgotpassword', { email }),

  resetPassword: (token, password) => api.put(`/api/auth/resetpassword/${token}`, { password }),
}