import api from '../api/axios'

export const blockService = {
  getAllForPage: (pageId) => api.get(`/api/blocks/${pageId}`),
  create: (pageId, data) => api.post(`/api/blocks/${pageId}`, data),
  update: (id, data) => api.put(`/api/blocks/${id}`, data),
  delete: (id) => api.delete(`/api/blocks/${id}`),
  reorder: (blockIds) => api.patch('/api/blocks/reorder', { blocks: blockIds }),
}