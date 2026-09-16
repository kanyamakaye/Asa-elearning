import api from './api'

export const getQuizzes = (params) => api.get('/quizzes/', { params }).then((r) => r.data)
export const getQuiz = (id) => api.get(`/quizzes/${id}/`).then((r) => r.data)
export const createQuiz = (data) => api.post('/quizzes/', data).then((r) => r.data)
export const updateQuiz = (id, data) => api.patch(`/quizzes/${id}/`, data).then((r) => r.data)
export const deleteQuiz = (id, reason) =>
  api.delete(`/quizzes/${id}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
export const publishQuiz = (id) => api.post(`/quizzes/${id}/publish/`).then((r) => r.data)

export const getQuestions = (quizId) => api.get(`/quizzes/${quizId}/questions/`).then((r) => r.data)
export const addQuestion = (quizId, data) => api.post(`/quizzes/${quizId}/questions/`, data).then((r) => r.data)
export const updateQuestion = (questionId, data) => api.put(`/quizzes/questions/${questionId}/`, data).then((r) => r.data)
export const deleteQuestion = (questionId) => api.delete(`/quizzes/questions/${questionId}/`).then((r) => r.data)
