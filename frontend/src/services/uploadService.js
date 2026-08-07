import api from '../api/axios'

// Uploads a short browser recording and returns the permanent URL stored by the audio block.
export const uploadService = {
  uploadAudio: (audioData, mimeType) => api.post('/api/uploads/audio', { audioData, mimeType }),
}
