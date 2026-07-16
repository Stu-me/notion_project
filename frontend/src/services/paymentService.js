import api from '../api/axios'

// Keeps every subscription-related API call in one place.
export const paymentService = {
  getPlans: () => api.get('/api/payments/plans'),
  createManualRequest: (data) => api.post('/api/payments/manual-request', data),
  getMyRequests: () => api.get('/api/payments/my-requests'),
  getMySubscription: () => api.get('/api/payments/subscription'),
}
