import { apiFetch } from './api'

export const DASHBOARD_ENDPOINT_BY_ROLE = {
  admin: '/dashboard/admin/',
  academic_manager: '/dashboard/academic/',
  instructor: '/dashboard/instructor/',
  student: '/dashboard/student/',
  content_manager: '/dashboard/content/',
  support_staff: '/dashboard/support/',
}

export function getDashboard(role, token, params = {}) {
  const path = DASHBOARD_ENDPOINT_BY_ROLE[role]
  if (!path) return Promise.reject(new Error(`No dashboard defined for role "${role}".`))
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null)),
  ).toString()
  return apiFetch(query ? `${path}?${query}` : path, { token })
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

export function issueCertificate(enrollmentId, token) {
  return apiFetch('/certificates/', { method: 'POST', body: { enrollment: enrollmentId }, token })
}

export function renewCertificate(id, token) {
  return apiFetch(`/certificates/${id}/renew/`, { method: 'POST', token })
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

// -- Messages (conversation-based) -------------------------------------

export function listConversations(token, params = {}) {
  return apiFetch(`/messages/conversations/?${new URLSearchParams(params)}`, { token })
}

// Starts a new conversation, or — if one already exists between these two
// users — reuses it and just appends this message (see the backend's
// one-to-one dedup rule).
export function startConversation({ recipient, message }, token) {
  return apiFetch('/messages/conversations/', { method: 'POST', body: { recipient, message }, token })
}

export function getConversationMessages(conversationId, token, params = {}) {
  return apiFetch(`/messages/conversations/${conversationId}/messages/?${new URLSearchParams(params)}`, { token })
}

export function sendConversationMessage(conversationId, content, token) {
  return apiFetch(`/messages/conversations/${conversationId}/messages/`, { method: 'POST', body: { content }, token })
}

export function markConversationRead(conversationId, token) {
  return apiFetch(`/messages/conversations/${conversationId}/read/`, { method: 'POST', token })
}

export function getUnreadMessageCount(token) {
  return apiFetch('/messages/unread-count/', { token })
}

// Role-scoped list of users the current user may start a new conversation
// with (instructors of enrolled courses / their own students / admin —
// see the backend's messaging.authorization module).
export function searchMessageContacts(token, search = '') {
  const qs = search ? `?${new URLSearchParams({ search })}` : ''
  return apiFetch(`/messages/contacts/${qs}`, { token })
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

export function getExam(id, token) {
  return apiFetch(`/exams/${id}/`, { token })
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

export function getExamQuestions(examId, token) {
  return apiFetch(`/exams/${examId}/questions/`, { token })
}

export function addExamQuestion(examId, body, token) {
  return apiFetch(`/exams/${examId}/questions/`, { method: 'POST', body, token })
}

export function updateExamQuestion(id, body, token) {
  return apiFetch(`/exams/questions/${id}/`, { method: 'PUT', body, token })
}

export function deleteExamQuestion(id, token) {
  return apiFetch(`/exams/questions/${id}/`, { method: 'DELETE', token })
}

export function activateExam(id, token) {
  return apiFetch(`/exams/${id}/activate/`, { method: 'POST', token })
}

// -- manual grading queue (essay/short-answer quiz & exam questions) --------

export function listAttemptsNeedingGrading(kind, token) {
  const prefix = kind === 'exam' ? '/exams/attempts/' : '/quizzes/attempts/'
  return apiFetch(`${prefix}?status=submitted`, { token })
}

export function gradeQuizAnswer(attemptId, body, token) {
  return apiFetch(`/quizzes/attempts/${attemptId}/grade-answer/`, { method: 'POST', body, token })
}

export function gradeExamAnswer(attemptId, body, token) {
  return apiFetch(`/exams/attempts/${attemptId}/grade-answer/`, { method: 'POST', body, token })
}
