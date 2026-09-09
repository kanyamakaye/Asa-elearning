import api from './api'

export const getSections = (lessonId) => api.get('/lessons/sections/', { params: { lesson: lessonId } }).then((r) => r.data)
export const createSection = (data) => api.post('/lessons/sections/', data).then((r) => r.data)
export const updateSection = (id, data) => api.patch(`/lessons/sections/${id}/`, data).then((r) => r.data)
export const deleteSection = (id) => api.delete(`/lessons/sections/${id}/`).then((r) => r.data)
