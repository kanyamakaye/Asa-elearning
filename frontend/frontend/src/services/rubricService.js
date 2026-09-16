import api from './api'

export const getRubrics = (params) => api.get('/assignments/rubrics/', { params }).then((r) => r.data)
export const getRubric = (id) => api.get(`/assignments/rubrics/${id}/`).then((r) => r.data)
export const createRubric = (data) => api.post('/assignments/rubrics/', data).then((r) => r.data)
export const updateRubric = (id, data) => api.patch(`/assignments/rubrics/${id}/`, data).then((r) => r.data)
export const deleteRubric = (id, reason) =>
  api.delete(`/assignments/rubrics/${id}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
