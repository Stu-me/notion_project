import api from '../api/axios'

export const pageService = {
  getAll: (workspaceId) => api.get('/api/pages', { params: { workspaceId } }),
  getById: (id) => api.get(`/api/pages/${id}`),
  create: (data) => api.post('/api/pages', data),
  update: (id, data) => api.put(`/api/pages/${id}`, data),
  delete: (id) => api.delete(`/api/pages/${id}`),
}
