import api from './api'

export const getModules = (unitId) => api.get('/courses/modules/', { params: { unit: unitId } }).then((r) => r.data)
export const getModule = (id) => api.get(`/courses/modules/${id}/`).then((r) => r.data)
export const getModulesForCourse = (courseId) => api.get('/courses/modules/', { params: { course: courseId } }).then((r) => r.data)
export const createModule = (data) => api.post('/courses/modules/', data).then((r) => r.data)
export const updateModule = (id, data) => api.patch(`/courses/modules/${id}/`, data).then((r) => r.data)
export const deleteModule = (id, reason) =>
  api.delete(`/courses/modules/${id}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
