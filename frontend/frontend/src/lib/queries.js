import { apiFetch } from './api'

export function getCategories() {
  return apiFetch('/courses/categories/')
}

export function getCourses({ search, category, page } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (page) params.set('page', page)
  const qs = params.toString()
  return apiFetch(`/courses/${qs ? `?${qs}` : ''}`)
}

export function getCourse(slug) {
  return apiFetch(`/courses/${slug}/`)
}

export function getInstructors() {
  return apiFetch('/instructors/')
}

export function getFaqs() {
  return apiFetch('/support/faqs/')
}

export function enrollInCourse(courseId, token) {
  return apiFetch('/enrollments/', { method: 'POST', body: { course: courseId }, token })
}

export function getMyEnrollments(token) {
  return apiFetch('/enrollments/', { token })
}
