import api from './api'

// GET/list/retrieve return raw DRF payloads; create/update/delete/publish/archive
// return the {success, message, data} envelope (see backend/common/responses.py).
export const getCourses = (params) => api.get('/courses/', { params }).then((r) => r.data)
export const getMyCourses = () => api.get('/courses/my-courses/').then((r) => r.data)
export const getCourse = (slug) => api.get(`/courses/${slug}/`).then((r) => r.data)
export const deleteCourse = (slug, reason) =>
  api.delete(`/courses/${slug}/`, reason ? { data: { reason } } : undefined).then((r) => r.data)
export const publishCourse = (slug) => api.post(`/courses/${slug}/publish/`).then((r) => r.data)
export const archiveCourse = (slug) => api.post(`/courses/${slug}/archive/`).then((r) => r.data)
export const getCategories = () => api.get('/courses/categories/').then((r) => r.data)

// Sends multipart/form-data when a thumbnail File is present (required for
// Django's FileField), otherwise plain JSON — either way, array fields
// (requirements/learning_objectives) go through as native JSON so DRF's
// JSONField parses them without a manual JSON.stringify step.
function toRequestBody(data) {
  if (!(data.thumbnail instanceof File)) {
    const { thumbnail: _thumbnail, ...rest } = data
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

export const createCourse = (data) => api.post('/courses/', toRequestBody(data)).then((r) => r.data)
export const updateCourse = (slug, data) => api.patch(`/courses/${slug}/`, toRequestBody(data)).then((r) => r.data)
