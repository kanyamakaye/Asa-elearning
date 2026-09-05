import { apiFetch } from './api'

export const DASHBOARD_ENDPOINT_BY_ROLE = {
  admin: '/dashboard/admin/',
  academic_manager: '/dashboard/academic/',
  instructor: '/dashboard/instructor/',
  student: '/dashboard/student/',
  content_manager: '/dashboard/content/',
  support_staff: '/dashboard/support/',
}

export function getDashboard(role, token) {
  const path = DASHBOARD_ENDPOINT_BY_ROLE[role]
  if (!path) return Promise.reject(new Error(`No dashboard defined for role "${role}".`))
  return apiFetch(path, { token })
}

// -- reused CRUD endpoints for the management list pages --------------------

export function listUsers(token, params = {}) {
  return apiFetch(`/users/?${new URLSearchParams(params)}`, { token })
}

export function createUser(body, token) {
  return apiFetch('/users/', { method: 'POST', body, token })
}

export function updateUser(id, body, token) {
  return apiFetch(`/users/${id}/`, { method: 'PATCH', body, token })
}

export function deleteUser(id, token) {
  return apiFetch(`/users/${id}/`, { method: 'DELETE', token })
}

export function listEnrollments(token, params = {}) {
  return apiFetch(`/enrollments/?${new URLSearchParams(params)}`, { token })
}

export function listCertificates(token, params = {}) {
  return apiFetch(`/certificates/?${new URLSearchParams(params)}`, { token })
}

export function listPayments(token, params = {}) {
  return apiFetch(`/payments/?${new URLSearchParams(params)}`, { token })
}

export function listSupportTickets(token, params = {}) {
  return apiFetch(`/support/tickets/?${new URLSearchParams(params)}`, { token })
}

export function updateSupportTicket(id, body, token) {
  return apiFetch(`/support/tickets/${id}/`, { method: 'PATCH', body, token })
}

export function listNotifications(token, params = {}) {
  return apiFetch(`/notifications/?${new URLSearchParams(params)}`, { token })
}

export function markNotificationRead(id, token) {
  return apiFetch(`/notifications/${id}/mark_read/`, { method: 'POST', token })
}

export function markAllNotificationsRead(token) {
  return apiFetch('/notifications/mark-all-read/', { method: 'POST', token })
}

export function listAuditLogs(token, params = {}) {
  return apiFetch(`/audit-logs/?${new URLSearchParams(params)}`, { token })
}

export function listRefunds(token, params = {}) {
  return apiFetch(`/payments/refunds/?${new URLSearchParams(params)}`, { token })
}

export function processRefund(id, status, token) {
  return apiFetch(`/payments/refunds/${id}/process/`, { method: 'POST', body: { status }, token })
}

export function listAnnouncements(token, params = {}) {
  return apiFetch(`/notifications/announcements/?${new URLSearchParams(params)}`, { token })
}

export function createAnnouncement(body, token) {
  return apiFetch('/notifications/announcements/', { method: 'POST', body, token })
}

export function deleteAnnouncement(id, token) {
  return apiFetch(`/notifications/announcements/${id}/`, { method: 'DELETE', token })
}

export function listMessages(token, params = {}) {
  return apiFetch(`/messages/?${new URLSearchParams(params)}`, { token })
}

export function sendMessage(body, token) {
  return apiFetch('/messages/', { method: 'POST', body, token })
}

export function markMessageRead(id, token) {
  return apiFetch(`/messages/${id}/mark_read/`, { method: 'POST', token })
}

export function listDiscussionTopics(token, params = {}) {
  return apiFetch(`/discussions/?${new URLSearchParams(params)}`, { token })
}

export function createDiscussionTopic(body, token) {
  return apiFetch('/discussions/', { method: 'POST', body, token })
}

export function deleteDiscussionTopic(id, token) {
  return apiFetch(`/discussions/${id}/`, { method: 'DELETE', token })
}

export function getDiscussionTopic(id, token) {
  return apiFetch(`/discussions/${id}/`, { token })
}

export function listDiscussionReplies(topicId, token) {
  return apiFetch(`/discussions/replies/?topic=${topicId}`, { token })
}

export function createDiscussionReply(body, token) {
  return apiFetch('/discussions/replies/', { method: 'POST', body, token })
}

export function listExams(token, params = {}) {
  return apiFetch(`/exams/?${new URLSearchParams(params)}`, { token })
}

export function createExam(body, token) {
  return apiFetch('/exams/', { method: 'POST', body, token })
}

export function updateExam(id, body, token) {
  return apiFetch(`/exams/${id}/`, { method: 'PATCH', body, token })
}

export function deleteExam(id, token) {
  return apiFetch(`/exams/${id}/`, { method: 'DELETE', token })
}
