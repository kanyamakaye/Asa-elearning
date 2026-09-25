import { apiFetch } from './api'

export function getCategories() {
  return apiFetch('/courses/categories/')
}

export function getCourses({ search, category, level, isFree, ordering, page, pageSize } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (level) params.set('level', level)
  if (isFree !== undefined) params.set('is_free', isFree ? 'true' : 'false')
  if (ordering) params.set('ordering', ordering)
  if (page) params.set('page', page)
  if (pageSize) params.set('page_size', pageSize)
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

// Used by CourseDetail to check "is the current user already enrolled in
// this course" so the page reflects real state on reload instead of always
// showing "Enroll Now" (and then erroring on the duplicate-enrollment check).
export function getMyEnrollmentForCourse(courseId, token) {
  return apiFetch(`/enrollments/?course=${courseId}`, { token })
}

// Full lesson content (video/text/pdf) for the Learn page — the backend
// 403s this unless the current user is enrolled (or manages the course).
export function getCourseLearn(slug, token) {
  return apiFetch(`/courses/${slug}/learn/`, { token })
}

// The signed-in student's full academic record — every course enrolled in,
// with hours, grade, and certificate status.
export function getMyTranscript(token) {
  return apiFetch('/enrollments/transcript/', { token })
}

export function getLessonProgress(courseId, token) {
  return apiFetch(`/progress/?course=${courseId}`, { token })
}

// Idempotent: get-or-creates the LessonProgress row and rolls the result up
// into the enrollment's overall completion_percentage server-side.
export function markLessonComplete(lessonId, token) {
  return apiFetch('/progress/complete/', { method: 'POST', body: { lesson: lessonId }, token })
}

// Published quizzes for a course (one course-wide "Knowledge Check" plus one
// per module) — the backend already filters out drafts for non-managers.
export function getCourseQuizzes(courseId, token) {
  return apiFetch(`/quizzes/?course=${courseId}`, { token })
}

// Full quiz detail with questions — options never include is_correct for a
// student, so this is safe to fetch before/during an attempt.
export function getQuiz(quizId, token) {
  return apiFetch(`/quizzes/${quizId}/`, { token })
}

export function getMyQuizAttempts(quizId, token) {
  return apiFetch(`/quizzes/attempts/?quiz=${quizId}`, { token })
}

export function startQuizAttempt(quizId, token) {
  return apiFetch(`/quizzes/${quizId}/start/`, { method: 'POST', token })
}

// Upserts one answer on an in-progress attempt — safe to call again if the
// student changes their selection before submitting.
export function answerQuizQuestion(attemptId, payload, token) {
  return apiFetch(`/quizzes/attempts/${attemptId}/answer/`, { method: 'POST', body: payload, token })
}

export function submitQuizAttempt(attemptId, token) {
  return apiFetch(`/quizzes/attempts/${attemptId}/submit/`, { method: 'POST', token })
}

// Exam mirrors of the quiz-taking functions above — same shape, /exams/ prefix.
export function getCourseExams(courseId, token) {
  return apiFetch(`/exams/?course=${courseId}`, { token })
}

export function getExam(examId, token) {
  return apiFetch(`/exams/${examId}/`, { token })
}

export function getMyExamAttempts(examId, token) {
  return apiFetch(`/exams/attempts/?exam=${examId}`, { token })
}

export function startExamAttempt(examId, token) {
  return apiFetch(`/exams/${examId}/start/`, { method: 'POST', token })
}

export function answerExamQuestion(attemptId, payload, token) {
  return apiFetch(`/exams/attempts/${attemptId}/answer/`, { method: 'POST', body: payload, token })
}

export function submitExamAttempt(attemptId, token) {
  return apiFetch(`/exams/attempts/${attemptId}/submit/`, { method: 'POST', token })
}
