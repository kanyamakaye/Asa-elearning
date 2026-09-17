import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCourseLearn, getCourseQuizzes, getLessonProgress, markLessonComplete } from '../lib/queries'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import RichText from '../components/RichText'
import QuizPlayer from '../components/QuizPlayer'
import {
  IconArrowRight,
  IconAward,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconClipboard,
  IconClock,
  IconClose,
  IconFileText,
  IconLock,
  IconMenu,
  IconPlay,
  IconVideo,
} from '../components/icons'

// How close to the bottom of the lesson content (in px) counts as "finished
// scrolling" — small enough to require actually reaching the end, but
// forgiving of sub-pixel rounding and footer padding.
const SCROLL_COMPLETE_THRESHOLD_PX = 48

const LESSON_ICON = {
  video: IconVideo,
  live_session: IconVideo,
  pdf: IconFileText,
  presentation: IconFileText,
  text: IconFileText,
  audio: IconFileText,
  external_link: IconFileText,
}

// YouTube links come through as normal watch/share URLs (that's what the
// course-creation form and the seed data both store) — turn them into an
// embeddable URL. Any other host is left as-is; the player falls back to a
// plain "open" link for those instead of trying to iframe them.
function toEmbedUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    }
    if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
      return url
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

function SectionPager({ sections }) {
  const [index, setIndex] = useState(0)
  // Purely local "seen it already" feedback on the outline pills below —
  // resets whenever the lesson changes (SectionPager is remounted via the
  // key={lesson.id} at its call site), not persisted as real progress.
  const [visited, setVisited] = useState(() => new Set([0]))
  const section = sections[Math.min(index, sections.length - 1)]
  const embedUrl = toEmbedUrl(section.video_url)

  function goTo(i) {
    setIndex(i)
    setVisited((prev) => new Set(prev).add(i))
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-700/40">
          {sections.length} sections in this submodule
        </p>
        <ol className="flex flex-wrap gap-2">
          {sections.map((s, i) => {
            const active = i === index
            const seen = visited.has(i)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-navy-900 text-white'
                      : seen
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-navy-50 text-navy-700/70 hover:bg-navy-100'
                  }`}
                >
                  {seen && !active && <IconCheck className="h-3 w-3" />}
                  {i + 1}. {s.title}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="rounded-2xl bg-navy-50/60 p-6">
        <h3 className="mb-3 text-base font-bold text-navy-900">{section.title}</h3>
        {embedUrl && (
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-navy-900">
            <iframe
              src={embedUrl}
              title={section.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        <RichText text={section.content} />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 disabled:opacity-40"
        >
          <IconChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <span className="text-xs font-semibold text-navy-700/50">Section {index + 1} of {sections.length}</span>
        <button
          type="button"
          onClick={() => goTo(Math.min(sections.length - 1, index + 1))}
          disabled={index === sections.length - 1}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 disabled:opacity-40"
        >
          Next section <IconArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function LessonContent({ lesson }) {
  const embedUrl = lesson.lesson_type === 'video' ? toEmbedUrl(lesson.video_url) : null
  const hasSections = lesson.sections?.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-sm leading-relaxed text-navy-700/65">{lesson.description}</p>
        )}
      </div>

      {lesson.lesson_type === 'video' && (
        embedUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-navy-900 shadow-lg shadow-navy-900/10">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : lesson.video_url ? (
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noreferrer"
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-navy-900 text-white shadow-lg shadow-navy-900/10 transition-colors hover:bg-navy-800"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <IconPlay className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold">Watch on original site</span>
          </a>
        ) : null
      )}

      {lesson.lesson_type === 'audio' && lesson.video_url && (
        <audio controls src={lesson.video_url} className="w-full rounded-xl">
          Your browser doesn&apos;t support the audio element.
        </audio>
      )}

      {lesson.lesson_type === 'live_session' && lesson.content_url && (
        <a
          href={lesson.content_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
        >
          Join Live Session
          <IconArrowRight className="h-4 w-4" />
        </a>
      )}

      {(lesson.lesson_type === 'external_link' || lesson.lesson_type === 'pdf' || lesson.lesson_type === 'presentation') &&
        lesson.content_url && (
          <a
            href={lesson.content_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
          >
            Open resource
            <IconArrowRight className="h-4 w-4" />
          </a>
        )}

      {hasSections ? (
        <SectionPager key={lesson.id} sections={[...lesson.sections].sort((a, b) => a.order - b.order)} />
      ) : (
        lesson.content && (
          <div className="rounded-2xl bg-navy-50/60 p-6">
            <RichText text={lesson.content} />
          </div>
        )
      )}

      {lesson.resources?.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-navy-900">Resources</h3>
          <ul className="mt-3 space-y-2">
            {lesson.resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.file || r.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-xl bg-navy-50/60 px-4 py-3 text-sm font-medium text-navy-800 transition-colors hover:bg-navy-50"
                >
                  <IconFileText className="h-4 w-4 shrink-0 text-navy-700/50" />
                  {r.title || r.file_name || 'Download'}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Learn() {
  const { slug } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [progressByLesson, setProgressByLesson] = useState({})
  // { type: 'lesson' | 'quiz', id } — a unified pointer into either list so
  // the sidebar can navigate between lessons and their module/final quizzes.
  const [activeItem, setActiveItem] = useState(null)
  // Shows the congrats screen. Set on load if the course was already fully
  // complete, or the moment the last lesson gets marked complete — but
  // clicking any lesson (including "Review lessons") switches back to the
  // lesson view so a finished course doesn't get permanently stuck on it.
  const [showCompletion, setShowCompletion] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Modules collapsed by the student via the sidebar chevron — absent from
  // this set means expanded (the default), matching the outline being fully
  // open on first load.
  const [collapsedModules, setCollapsedModules] = useState(() => new Set())
  // Lets the delayed auto-quiz-open below check where the student actually
  // is by the time its timer fires, instead of the stale value it closed over.
  const activeItemRef = useRef(activeItem)
  useEffect(() => {
    activeItemRef.current = activeItem
  }, [activeItem])
  // The scrollable lesson-content pane — watched to auto-complete a lesson
  // once the student scrolls to the end of it.
  const mainRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    let courseLessons = []
    getCourseLearn(slug, accessToken)
      .then((data) => {
        if (cancelled) return
        setCourse(data)
        courseLessons = (data.units ?? []).flatMap((u) => u.modules.flatMap((m) => m.lessons))
        return getLessonProgress(data.id, accessToken)
      })
      .then((data) => {
        if (cancelled || !data) return
        const results = data.results ?? data
        const map = {}
        results.forEach((p) => {
          map[p.lesson] = p
        })
        setProgressByLesson(map)
        // Resume on the first not-yet-completed lesson instead of always
        // lesson 1, so returning to an in-progress course picks up where
        // the student left off.
        const firstUnfinished = courseLessons.find((l) => !map[l.id]?.is_completed)
        const initial = firstUnfinished ?? courseLessons[0]
        setActiveItem(initial ? { type: 'lesson', id: initial.id } : null)
        if (courseLessons.length > 0 && !firstUnfinished) setShowCompletion(true)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load this course.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, accessToken])

  useEffect(() => {
    if (!course) return
    let cancelled = false
    getCourseQuizzes(course.id, accessToken)
      .then((data) => {
        if (!cancelled) setQuizzes(data.results ?? data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [course, accessToken])

  const lessons = useMemo(
    () =>
      (course?.units ?? []).flatMap((u) =>
        u.modules.flatMap((m) => m.lessons.map((lesson) => ({ ...lesson, _moduleId: m.id }))),
      ),
    [course],
  )
  const quizzesByModule = useMemo(() => {
    const map = {}
    quizzes.filter((q) => q.module).forEach((q) => {
      map[q.module] = [...(map[q.module] ?? []), q]
    })
    return map
  }, [quizzes])
  const finalQuizzes = useMemo(() => quizzes.filter((q) => !q.module), [quizzes])

  const activeLesson = activeItem?.type === 'lesson' ? lessons.find((l) => l.id === activeItem.id) ?? null : null
  const activeQuiz = activeItem?.type === 'quiz' ? quizzes.find((q) => q.id === activeItem.id) ?? null : null
  const activeIndex = activeLesson ? lessons.findIndex((l) => l.id === activeItem.id) : -1
  const completedCount = lessons.filter((l) => progressByLesson[l.id]?.is_completed).length
  const progressPercent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0
  const isActiveDone = activeLesson ? Boolean(progressByLesson[activeLesson.id]?.is_completed) : false

  async function handleMarkComplete() {
    if (!activeLesson || isActiveDone) return
    setMarking(true)
    try {
      const data = await markLessonComplete(activeLesson.id, accessToken)
      const updatedProgress = { ...progressByLesson, [activeLesson.id]: data.progress }
      setProgressByLesson(updatedProgress)
      if (data.enrollment?.status === 'completed') {
        setShowCompletion(true)
      } else {
        openModuleQuizIfJustFinished(activeLesson, updatedProgress)
      }
    } catch {
      // Non-fatal — the button just stays clickable so the student can retry.
    } finally {
      setMarking(false)
    }
  }

  // Once every lesson in a module is done, jump straight into that module's
  // quiz instead of leaving the student to notice and click it themselves.
  function openModuleQuizIfJustFinished(lesson, progressMap) {
    const moduleQuizzes = quizzesByModule[lesson._moduleId]
    if (!moduleQuizzes?.length) return
    const moduleLessons = lessons.filter((l) => l._moduleId === lesson._moduleId)
    const allDone = moduleLessons.every((l) => progressMap[l.id]?.is_completed)
    if (allDone) {
      setTimeout(() => {
        // Only steal navigation if the student is still sitting on the
        // lesson that just finished the module — not if they've already
        // clicked elsewhere in the ~1s before this fires.
        if (activeItemRef.current?.type === 'lesson' && activeItemRef.current.id === lesson.id) {
          goToItem('quiz', moduleQuizzes[0].id)
        }
      }, 1200)
    }
  }

  // handleMarkComplete closes over quizzesByModule/lessons, which can still
  // be loading when the scroll check below fires — a ref keeps it calling
  // whatever the latest version is at that moment, instead of a version
  // frozen back when the lesson first became active.
  const handleMarkCompleteRef = useRef(handleMarkComplete)
  useEffect(() => {
    handleMarkCompleteRef.current = handleMarkComplete
  })

  // Auto-complete a lesson once the student scrolls to the end of its
  // content, instead of requiring the "Mark as complete" click. Also fires
  // once, shortly after the lesson loads, for content short enough to
  // already fit on screen with nothing to scroll. Resets whenever the
  // active lesson changes, or the moment it's already done (e.g. marked
  // manually before the student finishes scrolling).
  useEffect(() => {
    const el = mainRef.current
    if (!el || !activeLesson || activeLesson.locked || isActiveDone) return
    el.scrollTop = 0

    function checkIfAtBottom() {
      if (el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_COMPLETE_THRESHOLD_PX) {
        handleMarkCompleteRef.current()
      }
    }

    el.addEventListener('scroll', checkIfAtBottom)
    // A short delay lets the lesson's own layout (images, embeds) settle
    // before judging whether it needs scrolling at all.
    const initialCheck = setTimeout(checkIfAtBottom, 400)
    return () => {
      el.removeEventListener('scroll', checkIfAtBottom)
      clearTimeout(initialCheck)
    }
  }, [activeLesson?.id, isActiveDone]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleModule(moduleId) {
    setCollapsedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  function goToItem(type, id) {
    setActiveItem({ type, id })
    setShowCompletion(false)
    setSidebarOpen(false)
  }

  function goToNext() {
    const next = lessons[activeIndex + 1]
    if (next) goToItem('lesson', next.id)
  }

  if (loading) return <LoadingSpinner label="Loading your course…" className="min-h-screen" />

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-50/40 px-6 text-center">
        <p className="max-w-sm text-sm text-navy-700/65">
          {error || 'This course is not available to learn right now.'}
        </p>
        <Link
          to={`/courses/${slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Back to course page
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-navy-50/30">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-navy-900/8 bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy-700/60 hover:bg-navy-50 lg:hidden"
          aria-label="Toggle lesson list"
        >
          {sidebarOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/courses/${slug}`)}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-700/55 hover:text-brand-500 lg:inline-flex"
        >
          <IconChevronLeft className="h-4 w-4" />
          Exit
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-navy-900">{course.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 w-full max-w-xs rounded-full bg-navy-900/8">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-navy-700/55">{progressPercent}%</span>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Lesson sidebar */}
        <aside
          className={`absolute inset-y-0 left-0 z-20 w-80 shrink-0 overflow-y-auto border-r border-navy-900/8 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {course.units.map((unit) => (
            <div key={unit.id}>
              <div className="border-b border-navy-900/8 bg-navy-50/60 px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-navy-700/50">{unit.title}</p>
              </div>
              {unit.modules.map((module) => {
                const moduleDone = module.lessons.filter((l) => progressByLesson[l.id]?.is_completed).length
                const modulePercent = module.lessons.length
                  ? Math.round((moduleDone / module.lessons.length) * 100)
                  : 0
                const collapsed = collapsedModules.has(module.id)
                return (
                <div key={module.id} className="border-b border-navy-900/6">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between gap-3 px-5 pt-3 pb-2 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-navy-700/50">{module.title}</span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className="h-1 w-full max-w-[7rem] rounded-full bg-navy-900/8">
                          <span
                            className="block h-1 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${modulePercent}%` }}
                          />
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold text-navy-700/40">{modulePercent}%</span>
                      </span>
                    </span>
                    <IconChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-navy-700/40 transition-transform ${collapsed ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsed && (
                  <ul className="px-2 py-2">
                    {module.lessons.map((lesson) => {
                      const Icon = LESSON_ICON[lesson.lesson_type] ?? IconFileText
                      const done = Boolean(progressByLesson[lesson.id]?.is_completed)
                      const active = activeItem?.type === 'lesson' && lesson.id === activeItem.id
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            disabled={lesson.locked}
                            onClick={() => goToItem('lesson', lesson.id)}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                              lesson.locked
                                ? 'cursor-not-allowed text-navy-700/35'
                                : active ? 'bg-brand-50 text-brand-700' : 'text-navy-800 hover:bg-navy-50'
                            }`}
                          >
                            {lesson.locked ? (
                              <IconLock className="h-4 w-4 shrink-0 text-navy-700/30" />
                            ) : done ? (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <IconCheck className="h-3 w-3" />
                              </span>
                            ) : (
                              <Icon className="h-4 w-4 shrink-0 text-navy-700/40" />
                            )}
                            <span className="min-w-0 flex-1 truncate font-medium">{lesson.title}</span>
                            <span className="shrink-0 text-[11px] text-navy-700/40">
                              {lesson.locked ? '' : lesson.sections?.length > 0 ? `${lesson.sections.length} pages` : `${lesson.duration_minutes || 0}m`}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                    {(quizzesByModule[module.id] ?? []).map((quiz) => {
                      const active = activeItem?.type === 'quiz' && quiz.id === activeItem.id
                      return (
                        <li key={`quiz-${quiz.id}`}>
                          <button
                            type="button"
                            onClick={() => goToItem('quiz', quiz.id)}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                              active ? 'bg-brand-50 text-brand-700' : 'text-navy-800 hover:bg-navy-50'
                            }`}
                          >
                            <IconClipboard className="h-4 w-4 shrink-0 text-navy-700/40" />
                            <span className="min-w-0 flex-1 truncate font-medium">{quiz.title}</span>
                            <span className="shrink-0 rounded-full bg-navy-900/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-700/50">
                              Quiz
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  )}
                </div>
              )})}
            </div>
          ))}

          {finalQuizzes.length > 0 && (
            <div>
              <div className="border-b border-navy-900/8 bg-navy-50/60 px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-navy-700/50">Final Assessment</p>
              </div>
              <ul className="px-2 py-2">
                {finalQuizzes.map((quiz) => {
                  const active = activeItem?.type === 'quiz' && quiz.id === activeItem.id
                  return (
                    <li key={`quiz-${quiz.id}`}>
                      <button
                        type="button"
                        onClick={() => goToItem('quiz', quiz.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          active ? 'bg-brand-50 text-brand-700' : 'text-navy-800 hover:bg-navy-50'
                        }`}
                      >
                        <IconAward className="h-4 w-4 shrink-0 text-navy-700/40" />
                        <span className="min-w-0 flex-1 truncate font-medium">{quiz.title}</span>
                        <span className="shrink-0 rounded-full bg-navy-900/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-700/50">
                          Quiz
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </aside>
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close lesson list"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-10 bg-navy-900/30 lg:hidden"
          />
        )}

        {/* Main content */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">
            {showCompletion ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center ring-1 ring-navy-900/8">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <IconAward className="h-8 w-8" />
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Course complete! 🎉</h1>
                  <p className="mt-2 text-sm text-navy-700/60">
                    You&apos;ve finished every lesson in {course.title}.
                    {course.certificate_enabled && ' Your certificate has been issued.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {finalQuizzes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => goToItem('quiz', finalQuizzes[0].id)}
                      className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500"
                    >
                      Take Final Assessment
                      <IconArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {course.certificate_enabled && (
                    <Link
                      to="/dashboard/certificates"
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50"
                    >
                      View my certificate
                    </Link>
                  )}
                  <Link
                    to="/dashboard/my-courses"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50"
                  >
                    Back to My Courses
                  </Link>
                </div>
                {lessons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => goToItem('lesson', lessons[0].id)}
                    className="text-xs font-semibold text-navy-700/45 hover:text-brand-500"
                  >
                    Review lessons
                  </button>
                )}
              </div>
            ) : activeQuiz ? (
              <QuizPlayer quiz={activeQuiz} accessToken={accessToken} />
            ) : activeLesson?.locked ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center ring-1 ring-navy-900/8">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700/40">
                  <IconLock className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="text-lg font-bold text-navy-900">This lesson is locked</h1>
                  <p className="mt-1 text-sm text-navy-700/60">Complete the previous lesson to unlock "{activeLesson.title}".</p>
                </div>
              </div>
            ) : activeLesson ? (
              <>
                <LessonContent lesson={activeLesson} />

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-navy-900/8 pt-6">
                  <div className="inline-flex items-center gap-1.5 text-xs text-navy-700/50">
                    <IconClock className="h-3.5 w-3.5" />
                    Lesson {activeIndex + 1} of {lessons.length}
                    {!isActiveDone && <span className="hidden sm:inline">· scroll to the end to auto-complete</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={marking || isActiveDone}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-70 ${
                        isActiveDone
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-navy-900 text-white hover:bg-brand-500'
                      }`}
                    >
                      {isActiveDone ? (
                        <>
                          <IconCheck className="h-4 w-4" /> Completed
                        </>
                      ) : marking ? (
                        'Saving…'
                      ) : (
                        'Mark as complete'
                      )}
                    </button>
                    {activeIndex < lessons.length - 1 && (
                      <button
                        type="button"
                        onClick={goToNext}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50"
                      >
                        Next
                        <IconArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-navy-700/55">This course doesn&apos;t have any published lessons yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
