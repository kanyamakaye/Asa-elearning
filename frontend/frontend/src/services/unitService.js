import api from './api'

export const getUnits = (courseId) => api.get('/courses/units/', { params: { course: courseId } }).then((r) => r.data)
export const createUnit = (data) => api.post('/courses/units/', data).then((r) => r.data)
export const updateUnit = (id, data) => api.patch(`/courses/units/${id}/`, data).then((r) => r.data)
export const deleteUnit = (id) => api.delete(`/courses/units/${id}/`).then((r) => r.data)
