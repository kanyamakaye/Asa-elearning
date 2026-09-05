import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { enrollInCourse, getCourse } from '../lib/queries'
import {
  IconArrowRight,
  IconCheck,
  IconClipboard,
  IconClock,
  IconStar,
  IconUsers,
} from '../components/icons'

export default function CourseDetail() {
  const { slug } = useParams()
  const { isAuthenticated, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getCourse(slug)
      .then((data) => {
        if (!cancelled) setCourse(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Course not found.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  async function handleEnroll() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    setEnrolling(true)
    setEnrollError('')
    try {
      await enrollInCourse(course.id, accessToken)
      setEnrolled(true)
    } catch (err) {
      setEnrollError(err.message || 'Unable to enroll right now.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-navy-700/50">
        Loading course…
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-navy-700/60">{error || 'Course not found.'}</p>
        <Link to="/#courses" className="font-semibold text-brand-500 hover:text-navy-900">
          Back to courses
        </Link>
      </div>
    )
  }

  return (
    <>
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-medium text-navy-100/50">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/#courses" className="hover:text-white">Courses</Link>
            <span>/</span>
            <span className="text-navy-100/80">{course.title}</span>
          </nav>

          {course.category && (
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-300">
              {course.category.name}
            </p>
          )}
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-navy-100/70">{course.short_description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-navy-100/70">
            <span className="inline-flex items-center gap-1.5">
              <IconStar className="h-4 w-4 text-amber-400" />
              {course.average_rating ?? 'No ratings yet'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconUsers className="h-4 w-4" />
              {course.enrolled_count} students
            </span>
            <span className="capitalize">{course.level}</span>
            <span>{course.language}</span>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-navy-900">About this course</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-700/70">
              {course.description || 'No description provided yet.'}
            </p>

            {course.units?.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-navy-900">Course content</h2>
                <div className="mt-4 space-y-4">
                  {course.units.map((unit) => (
                    <div key={unit.id} className="rounded-2xl ring-1 ring-navy-900/8">
                      <div className="border-b border-navy-900/8 px-5 py-3 text-sm font-bold text-navy-900">{unit.title}</div>
                      <div className="divide-y divide-navy-900/8">
                        {unit.modules.map((module) => (
                          <div key={module.id} className="flex items-center justify-between p-5">
                            <span className="text-sm font-semibold text-navy-900">{module.title}</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-navy-700/55">
                              <IconClipboard className="h-3.5 w-3.5" />
                              {module.lesson_count} lessons
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-3xl p-6 ring-1 ring-navy-900/8">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
              {course.instructor?.full_name?.[0] ?? '?'}
            </div>
            <p className="mt-2 text-sm text-navy-700/70">
              Taught by <span className="font-semibold text-navy-900">{course.instructor?.full_name}</span>
            </p>

            <p className="mt-5 text-3xl font-extrabold text-navy-900">
              {course.is_free ? 'Free' : `$${course.price}`}
            </p>

            {enrolled ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <IconCheck className="h-4 w-4" />
                You're enrolled!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
              >
                {enrolling ? 'Enrolling…' : 'Enroll Now'}
                {!enrolling && <IconArrowRight className="h-4 w-4" />}
              </button>
            )}
            {enrollError && <p className="mt-3 text-xs font-medium text-red-600">{enrollError}</p>}

            <div className="mt-6 space-y-3 border-t border-navy-900/8 pt-6 text-sm text-navy-700/70">
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4" />
                {course.duration_hours}h total
              </div>
              {course.certificate_enabled && (
                <div className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4" />
                  Certificate on completion
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
