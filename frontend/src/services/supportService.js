import api from '../api/axios'

// Contains user-facing support calls, separated from payment and admin services.
export const supportService = {
  createQuery: (payload) => api.post('/api/support/queries', payload),
  getMyQueries: () => api.get('/api/support/my-queries'),
}
