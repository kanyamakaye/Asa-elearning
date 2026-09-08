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

export function getCourseReviews(courseId) {
  return apiFetch(`/reviews/?course=${courseId}&page_size=6`)
}

// Site-wide (no course filter) — the backend excludes blank-quote reviews
// in that mode, so this is safe to use directly as homepage testimonials.
export function getTestimonials(pageSize = 6) {
  return apiFetch(`/reviews/?page_size=${pageSize}&ordering=-rating`)
}

export function getPlatformStats() {
  return apiFetch('/courses/stats/')
}

export function getInstructors() {
  return apiFetch('/instructors/')
}

export function getFaqs(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/support/faqs/${qs ? `?${qs}` : ''}`)
}

export function enrollInCourse(courseId, token) {
  return apiFetch('/enrollments/', { method: 'POST', body: { course: courseId }, token })
}

export function getMyEnrollments(token) {
  return apiFetch('/enrollments/', { token })
}
