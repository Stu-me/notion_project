import api from '../api/axios'

export const workspaceService = {
  getAll: () => api.get('/api/workspaces'),
  create: (data) => api.post('/api/workspaces', data),
  update: (id, data) => api.put(`/api/workspaces/${id}`, data),
  delete: (id) => api.delete(`/api/workspaces/${id}`),
}