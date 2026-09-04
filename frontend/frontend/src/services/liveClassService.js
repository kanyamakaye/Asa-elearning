import api from './api'

export const getLiveClasses = (params) => api.get('/live-classes/', { params }).then((r) => r.data)
export const getUpcomingLiveClasses = () => api.get('/live-classes/upcoming/').then((r) => r.data)
export const getLiveClass = (id) => api.get(`/live-classes/${id}/`).then((r) => r.data)
export const createLiveClass = (data) => api.post('/live-classes/', data).then((r) => r.data)
export const updateLiveClass = (id, data) => api.patch(`/live-classes/${id}/`, data).then((r) => r.data)
export const deleteLiveClass = (id) => api.delete(`/live-classes/${id}/`).then((r) => r.data)
export const cancelLiveClass = (id) => api.post(`/live-classes/${id}/cancel/`).then((r) => r.data)
export const completeLiveClass = (id) => api.post(`/live-classes/${id}/complete/`).then((r) => r.data)
