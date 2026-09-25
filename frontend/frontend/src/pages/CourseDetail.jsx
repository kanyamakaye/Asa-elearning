import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { API_BASE_URL } from '../lib/api'
import useCurrency from '../hooks/useCurrency'
import { enrollInCourse, getCourse, getCourseReviews, getMyEnrollmentForCourse } from '../lib/queries'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  IconArrowRight,
  IconAward,
  IconBook,
  IconCheck,
  IconChevronDown,
  IconClipboard,
  IconClock,
  IconFileText,
  IconLock,
  IconPlay,
  IconStar,
  IconUsers,
  IconVideo,
} from '../components/icons'

const LESSON_ICON = {
  video: IconVideo,
  live_session: IconVideo,
  pdf: IconFileText,
  presentation: IconFileText,
  text: IconFileText,
  audio: IconFileText,
  external_link: IconFileText,
}

function ModuleAccordion({ unit }) {
  const { t } = useLanguage()
  const [openModules, setOpenModules] = useState(() => new Set(unit.modules.length === 1 ? [unit.modules[0].id] : []))

  function toggle(id) {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-navy-900/8 dark:ring-white/10">
      <div className="border-b border-navy-900/8 bg-navy-50/60 px-5 py-3 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-bold text-navy-900 dark:text-white">{unit.title}</p>
        {unit.description && <p className="mt-0.5 text-xs text-navy-700/50 dark:text-navy-100/50">{unit.description}</p>}
      </div>
      <div className="divide-y divide-navy-900/8 dark:divide-white/10">
        {unit.modules.map((module) => {
          const open = openModules.has(module.id)
          return (
            <div key={module.id}>
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-navy-50/40 dark:hover:bg-white/5"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-navy-900 dark:text-white">
                  <IconChevronDown className={`h-4 w-4 shrink-0 text-navy-700/40 dark:text-navy-100/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  {module.title}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-navy-700/55 dark:text-navy-100/55">
                  <IconClipboard className="h-3.5 w-3.5" />
                  {t('public.courseDetail.lessonCount', { count: module.lesson_count })}
                  {module.quiz_count > 0 && ` · ${t('public.courseDetail.quizCount', { count: module.quiz_count })}`}
                </span>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  {module.lessons?.length > 0 ? (
                    <ul className="divide-y divide-navy-900/6 bg-navy-50/25 px-5 pb-4 dark:divide-white/5 dark:bg-white/[0.02]">
                      {module.lessons.map((lesson, i) => {
                        const Icon = LESSON_ICON[lesson.lesson_type] ?? IconFileText
                        return (
                          <li key={lesson.id} className="flex items-center gap-3 py-3">
                            <Icon className="h-4 w-4 shrink-0 text-navy-700/40 dark:text-navy-100/40" />
                            <span className="min-w-0 flex-1 truncate text-sm text-navy-800 dark:text-navy-100">
                              {i + 1}. {lesson.title}
                            </span>
                            {lesson.is_preview && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                                <IconPlay className="h-2.5 w-2.5" /> {t('public.courseDetail.preview')}
                              </span>
                            )}
                            <span className="shrink-0 text-xs text-navy-700/45 dark:text-navy-100/45">{t('public.courseDetail.minutes', { count: lesson.duration_minutes || 0 })}</span>
                            {!lesson.is_preview && <IconLock className="h-3.5 w-3.5 shrink-0 text-navy-700/25 dark:text-navy-100/25" />}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="px-5 pb-4 text-xs text-navy-700/45 dark:text-navy-100/45">{t('public.courseDetail.noLessonsYet')}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CourseDetail() {
  const { t } = useLanguage()
  const formatCurrency = useCurrency()
  const { slug } = useParams()
  const { isAuthenticated, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [course, setCourse] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')
  const [enrolled, setEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getCourse(slug)
      .then((data) => {
        if (cancelled) return
        setCourse(data)
        getCourseReviews(data.id).then((r) => {
          if (cancelled) return
          setReviews(r.results ?? r)
          setReviewsTotal(r.count ?? (r.results ?? r).length)
        }).catch(() => {})
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('public.courseDetail.notFound'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  // Reflect real enrollment state on load/reload — without this, a student
  // revisiting a course they're already enrolled in always saw "Enroll Now"
  // again, and clicking it just errored on the backend's duplicate check.
  useEffect(() => {
    if (!course || !isAuthenticated) {
      setCheckingEnrollment(false)
      return
    }
    let cancelled = false
    setCheckingEnrollment(true)
    getMyEnrollmentForCourse(course.id, accessToken)
      .then((data) => {
        if (cancelled) return
        const results = data.results ?? data
        setEnrolled(results.length > 0)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingEnrollment(false)
      })
    return () => {
      cancelled = true
    }
  }, [course, isAuthenticated, accessToken])

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
      // Stale local state (e.g. enrolled in another tab) still lands here as
      // a "safe" outcome — the student is enrolled either way, so reflect
      // that instead of showing a scary error for something that isn't one.
      if (err.message?.toLowerCase().includes('already enrolled')) {
        setEnrolled(true)
      } else {
        setEnrollError(err.message || t('public.courseDetail.enrollError'))
      }
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <LoadingSpinner label={t('public.courseDetail.loading')} className="min-h-[60vh]" />

  if (error || !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-navy-700/60 dark:text-navy-100/60">{error || t('public.courseDetail.notFound')}</p>
        <Link to="/courses" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
          {t('public.courseDetail.backToCourses')}
        </Link>
      </div>
    )
  }

  const totalLessons = (course.units ?? []).reduce(
    (sum, u) => sum + u.modules.reduce((s, m) => s + (m.lesson_count ?? 0), 0),
    0
  )
  const avgFromReviews = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle at 85% 0%, rgba(111,143,255,0.3), transparent 45%)',
          }}
        />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-3 lg:px-8">
          <div className="animate-fade-up lg:col-span-2">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-navy-100/50">
              <Link to="/" className="hover:text-white">{t('public.pageHeader.home')}</Link>
              <span>/</span>
              <Link to="/courses" className="hover:text-white">{t('public.nav.courses')}</Link>
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
                {course.average_rating ?? avgFromReviews ?? t('public.courseDetail.noRatings')}
                {reviewsTotal > 0 && <span className="text-navy-100/45">({reviewsTotal})</span>}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconUsers className="h-4 w-4" />
                {t('public.courseDetail.studentsCount', { count: course.enrolled_count })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconBook className="h-4 w-4" />
                {t('public.courseDetail.lessonCount', { count: totalLessons })}
              </span>
              <span className="capitalize">{course.level}</span>
              <span>{course.language}</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                {course.instructor?.profile_picture ? (
                  <img src={course.instructor.profile_picture} alt="" className="h-full w-full object-cover" />
                ) : (
                  course.instructor?.full_name?.[0] ?? '?'
                )}
              </div>
              <p className="text-sm text-navy-100/70">
                {t('public.courseDetail.createdBy')} <span className="font-semibold text-white">{course.instructor?.full_name}</span>
              </p>
            </div>
          </div>

          {/* Preview card, visible on lg+ where the sidebar isn't stacked here */}
          <div className="animate-fade-up hidden [animation-delay:100ms] lg:block">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">
              <div className="relative flex h-40 items-center justify-center bg-navy-800">
                {course.image || course.thumbnail ? (
                  <img src={course.image || course.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <IconBook className="h-10 w-10 text-white/20" />
                )}
                {course.video_url && (
                  <a
                    href={course.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
                    aria-label={t('public.courseDetail.watchPreview')}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg">
                      <IconPlay className="h-5 w-5" />
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-950">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-10 lg:col-span-2">
            {course.learning_objectives?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.whatYouLearn')}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.learning_objectives.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-xl bg-navy-50/60 p-3.5 text-sm text-navy-700/80 dark:bg-white/5 dark:text-navy-100/80">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.aboutCourse')}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-700/70 dark:text-navy-100/70">
                {course.description || t('public.courseDetail.noDescription')}
              </p>
            </div>

            {course.requirements?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.requirements')}</h2>
                <ul className="mt-3 space-y-2">
                  {course.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-navy-700/70 dark:text-navy-100/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-700/40 dark:bg-navy-100/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.prerequisite_title && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                {t('public.courseDetail.requiresCompleting')} <span className="font-semibold">{course.prerequisite_title}</span> {t('public.courseDetail.first')}.
              </div>
            )}

            {course.units?.length > 0 && (
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.courseContent')}</h2>
                  <p className="text-xs text-navy-700/50 dark:text-navy-100/50">
                    {t('public.courseDetail.unitCount', { count: course.units.length })} &middot; {t('public.courseDetail.submoduleCount', { count: totalLessons })}
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  {course.units.map((unit) => (
                    <ModuleAccordion key={unit.id} unit={unit} />
                  ))}
                </div>
              </div>
            )}

            {course.certificate_enabled && (
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.certificate')}</h2>
                <p className="mt-1 text-sm text-navy-700/60 dark:text-navy-100/60">
                  {t('public.courseDetail.certificateDescription')}
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-navy-900/8 dark:ring-white/10">
                  <img
                    src={`${API_BASE_URL}/courses/${course.slug}/certificate-sample/`}
                    alt={t('public.courseDetail.certificateSampleAlt', { title: course.title })}
                    loading="lazy"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {course.co_instructors?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.teachingTeam')}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {course.co_instructors.map((ci) => (
                    <div key={ci.id} className="flex items-center gap-3 rounded-xl bg-navy-50/60 p-4 dark:bg-white/5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-900 text-sm font-bold text-white">
                        {ci.instructor.profile_picture ? (
                          <img src={ci.instructor.profile_picture} alt="" className="h-full w-full object-cover" />
                        ) : (
                          ci.instructor.full_name?.[0] ?? '?'
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900 dark:text-white">{ci.instructor.full_name}</p>
                        <p className="text-xs capitalize text-navy-700/50 dark:text-navy-100/50">{ci.instructor_role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews?.length > 0 && (
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-navy-900 dark:text-white">{t('public.courseDetail.studentReviews')}</h2>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900 dark:text-white">
                    <IconStar className="h-4 w-4 text-amber-400" />
                    {course.average_rating ?? avgFromReviews} ({reviewsTotal})
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl bg-navy-50/60 p-5 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-navy-900 dark:text-white">{r.student?.full_name ?? t('public.courseDetail.defaultStudent')}</p>
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <IconStar key={i} className={`h-3.5 w-3.5 ${i < r.rating ? '' : 'text-navy-900/10 dark:text-white/10'}`} />
                          ))}
                        </div>
                      </div>
                      {r.review_text && <p className="mt-2 text-sm leading-relaxed text-navy-700/70 dark:text-navy-100/70">{r.review_text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-4 rounded-3xl p-6 ring-1 ring-navy-900/8 dark:ring-white/10 lg:sticky lg:top-24">
            {(course.image || course.thumbnail) && (
              <div className="-m-6 mb-2 overflow-hidden rounded-t-3xl">
                <img src={course.image || course.thumbnail} alt="" className="h-36 w-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                {course.instructor?.profile_picture ? (
                  <img src={course.instructor.profile_picture} alt="" className="h-full w-full object-cover" />
                ) : (
                  course.instructor?.full_name?.[0] ?? '?'
                )}
              </div>
              <p className="text-sm text-navy-700/70 dark:text-navy-100/70">
                {t('public.courseDetail.taughtBy')} <span className="font-semibold text-navy-900 dark:text-white">{course.instructor?.full_name}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              {course.is_free ? (
                <p className="text-3xl font-extrabold text-navy-900 dark:text-white">{t('public.courseDetail.free')}</p>
              ) : course.discount_price ? (
                <>
                  <p className="text-3xl font-extrabold text-navy-900 dark:text-white">{formatCurrency(course.discount_price)}</p>
                  <p className="text-base font-medium text-navy-700/40 line-through dark:text-navy-100/40">{formatCurrency(course.price)}</p>
                </>
              ) : (
                <p className="text-3xl font-extrabold text-navy-900 dark:text-white">{formatCurrency(course.price)}</p>
              )}
            </div>

            {checkingEnrollment ? (
              <div className="h-[50px] w-full animate-pulse rounded-full bg-navy-50 dark:bg-white/5" />
            ) : enrolled ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <IconCheck className="h-4 w-4" />
                  {t('public.courseDetail.enrolled')}
                </div>
                <Link
                  to={`/learn/${course.slug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/30 dark:bg-brand-500 dark:hover:bg-brand-400"
                >
                  {t('public.hero.primaryCta')}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {enrolling ? t('public.courseDetail.enrolling') : t('public.courseDetail.enrollNow')}
                {!enrolling && <IconArrowRight className="h-4 w-4" />}
              </button>
            )}
            {enrollError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{enrollError}</p>}

            <div className="space-y-3 border-t border-navy-900/8 pt-4 text-sm text-navy-700/70 dark:border-white/10 dark:text-navy-100/70">
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4 shrink-0" />
                {t('public.courseDetail.totalHours', { count: course.duration_hours })}
              </div>
              <div className="flex items-center gap-2">
                <IconBook className="h-4 w-4 shrink-0" />
                {t('public.courseDetail.submoduleCount', { count: totalLessons })}
              </div>
              {course.certificate_enabled && (
                <div className="flex items-center gap-2">
                  <IconAward className="h-4 w-4 shrink-0" />
                  {t('public.courseDetail.certificateOnCompletion')}
                </div>
              )}
              <div className="flex items-center gap-2 capitalize">
                <IconClipboard className="h-4 w-4 shrink-0" />
                {t('public.courseDetail.levelLabel', { level: course.level })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
