import api from '../api/axios'

// Groups all master-admin payment and subscription requests in one service.
export const adminService = {
  getPaymentRequests: (status = 'pending') => api.get('/api/admin/payments', { params: { status } }),
  approvePayment: (paymentId) => api.patch(`/api/admin/payments/${paymentId}/approve`),
  rejectPayment: (paymentId, reason) => api.patch(`/api/admin/payments/${paymentId}/reject`, { reason }),
  getSubscriptions: () => api.get('/api/admin/subscriptions'),
  suspendSubscription: (userId) => api.patch(`/api/admin/subscriptions/${userId}/suspend`),
}
