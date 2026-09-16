import api from './api'

export const getLessons = (moduleId) => api.get('/lessons/', { params: { module: moduleId } }).then((r) => r.data)
export const getLesson = (id) => api.get(`/lessons/${id}/`).then((r) => r.data)
export const createLesson = (data) => api.post('/lessons/', data).then((r) => r.data)
export const updateLesson = (id, data) => api.patch(`/lessons/${id}/`, data).then((r) => r.data)
export const deleteLesson = (id, reason) =>
  api.delete(`/lessons/${id}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
