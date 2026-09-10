import api from './api'

export const getQuestionBanks = (params) => api.get('/question-banks/', { params }).then((r) => r.data)
export const getQuestionBank = (id) => api.get(`/question-banks/${id}/`).then((r) => r.data)
export const createQuestionBank = (data) => api.post('/question-banks/', data).then((r) => r.data)
export const updateQuestionBank = (id, data) => api.patch(`/question-banks/${id}/`, data).then((r) => r.data)
export const deleteQuestionBank = (id) => api.delete(`/question-banks/${id}/`).then((r) => r.data)

export const getBankQuestions = (bankId) => api.get('/question-banks/questions/', { params: { bank: bankId } }).then((r) => r.data)
export const createBankQuestion = (data) => api.post('/question-banks/questions/', data).then((r) => r.data)
export const updateBankQuestion = (id, data) => api.put(`/question-banks/questions/${id}/`, data).then((r) => r.data)
export const deleteBankQuestion = (id) => api.delete(`/question-banks/questions/${id}/`).then((r) => r.data)

export const addQuestionsFromBank = (quizId, bankQuestionIds) =>
  api.post(`/quizzes/${quizId}/add-from-bank/`, { bank_question_ids: bankQuestionIds }).then((r) => r.data)
