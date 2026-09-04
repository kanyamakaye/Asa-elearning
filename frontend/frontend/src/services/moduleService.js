import api from './api'

export const getModules = (courseId) => api.get('/courses/modules/', { params: { course: courseId } }).then((r) => r.data)
export const createModule = (data) => api.post('/courses/modules/', data).then((r) => r.data)
export const updateModule = (id, data) => api.patch(`/courses/modules/${id}/`, data).then((r) => r.data)
export const deleteModule = (id) => api.delete(`/courses/modules/${id}/`).then((r) => r.data)
