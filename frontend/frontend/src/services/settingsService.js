import api from './api'

export const getPlatformSettings = () => api.get('/settings/platform/').then((r) => r.data)
export const updatePlatformSettings = (data) => api.patch('/settings/platform/', data).then((r) => r.data)
