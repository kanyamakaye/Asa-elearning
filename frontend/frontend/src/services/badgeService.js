import api from './api'

export const getMyBadges = () => api.get('/certificates/badges/mine/').then((r) => r.data)
