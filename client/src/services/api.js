import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const profileApi = {
  getAll: () => api.get('/profiles'),
  get: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  updateTimezone: (id, timezone) => api.patch(`/profiles/${id}/timezone`, { timezone })
}

export const eventApi = {
  getAll: (profileId) => {
    const params = profileId ? { profileId } : {}
    return api.get('/events', { params })
  },
  get: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getLogs: (id) => api.get(`/events/${id}/logs`)
}

export default api
