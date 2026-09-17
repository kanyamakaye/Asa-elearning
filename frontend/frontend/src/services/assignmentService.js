import api from './api'

// Same multipart-when-a-File-is-present strategy as courseService — see there for why.
function toRequestBody(data) {
  if (!(data.attachment instanceof File)) {
    const { attachment: _attachment, ...rest } = data
    return rest
  }
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) formData.append(key, JSON.stringify(value))
    else formData.append(key, value)
  })
  return formData
}

export const getAssignments = (params) => api.get('/assignments/', { params }).then((r) => r.data)
export const getAssignment = (id) => api.get(`/assignments/${id}/`).then((r) => r.data)
export const createAssignment = (data) => api.post('/assignments/', toRequestBody(data)).then((r) => r.data)
export const updateAssignment = (id, data) => api.patch(`/assignments/${id}/`, toRequestBody(data)).then((r) => r.data)
export const deleteAssignment = (id, reason) =>
  api.delete(`/assignments/${id}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
export const publishAssignment = (id) => api.post(`/assignments/${id}/publish/`).then((r) => r.data)

export const getSubmissions = (assignmentId) => api.get(`/assignments/${assignmentId}/submissions/`).then((r) => r.data)
export const submitAssignment = (assignmentId, data) => {
  const body = data.file instanceof File
    ? Object.entries(data).reduce((fd, [k, v]) => (v != null && v !== '' ? (fd.append(k, v), fd) : fd), new FormData())
    : data
  return api.post(`/assignments/${assignmentId}/submit/`, body).then((r) => r.data)
}
export const gradeSubmission = (submissionId, data) =>
  api.patch(`/assignments/submissions/${submissionId}/grade/`, data).then((r) => r.data)
