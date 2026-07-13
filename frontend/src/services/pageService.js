import api from '../api/axios'

export const pageService = {
  getAll: () => api.get('/api/pages'),
  getById: (id) => api.get(`/api/pages/${id}`),
  create: (data) => api.post('/api/pages', data),
  update: (id, data) => api.put(`/api/pages/${id}`, data),
  delete: (id) => api.delete(`/api/pages/${id}`),
}