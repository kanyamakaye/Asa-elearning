import api from './api'

export const getGroups = (params) => api.get('/groups/', { params }).then((r) => r.data)
export const getGroup = (id) => api.get(`/groups/${id}/`).then((r) => r.data)
export const createGroup = (data) => api.post('/groups/', data).then((r) => r.data)
export const updateGroup = (id, data) => api.patch(`/groups/${id}/`, data).then((r) => r.data)
export const deleteGroup = (id) => api.delete(`/groups/${id}/`).then((r) => r.data)

export const addGroupMember = (groupId, studentId) =>
  api.post(`/groups/${groupId}/add-member/`, { student_id: studentId }).then((r) => r.data)
export const removeGroupMember = (groupId, studentId) =>
  api.post(`/groups/${groupId}/remove-member/`, { student_id: studentId }).then((r) => r.data)

export const assignGroupCourse = (groupId, courseId) =>
  api.post(`/groups/${groupId}/assign-course/`, { course_id: courseId }).then((r) => r.data)
export const removeGroupCourse = (groupId, courseId) =>
  api.post(`/groups/${groupId}/remove-course/`, { course_id: courseId }).then((r) => r.data)
