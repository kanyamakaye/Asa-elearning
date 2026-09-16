import api from './api'

export const getSections = (lessonId) => api.get('/lessons/sections/', { params: { lesson: lessonId } }).then((r) => r.data)
export const createSection = (data) => api.post('/lessons/sections/', data).then((r) => r.data)
export const updateSection = (id, data) => api.patch(`/lessons/sections/${id}/`, data).then((r) => r.data)
export const deleteSection = (id, reason) =>
  api.delete(`/lessons/sections/${id}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
