import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { enrollInCourse, getCategories, getCourses, getMyEnrollments } from '../../lib/queries'
import useCurrency from '../../hooks/useCurrency'
import { IconArrowRight, IconBook, IconCheck, IconClipboard, IconSearch, IconStar, IconUsers } from '../../components/icons'

export default function BrowseCourses() {
  const formatCurrency = useCurrency()
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')

  const [courses, setCourses] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set())
  const [enrollingId, setEnrollingId] = useState(null)

  useEffect(() => {
    getCategories().then((data) => setCategories(data.results ?? data)).catch(() => {})
  }, [])

  useEffect(() => {
    getMyEnrollments(accessToken)
      .then((data) => {
        const results = data.results ?? data
        setEnrolledCourseIds(new Set(results.map((e) => e.course)))
      })
      .catch(() => {})
  }, [accessToken])

  // Debounce the search box so every keystroke doesn't fire a request.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 350)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPage(1)
    getCourses({ search, category: activeCategory === 'all' ? undefined : activeCategory, page: 1 })
      .then((data) => {
        if (cancelled) return
        setCourses(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
        setNext(data.next ?? null)
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([])
          setCount(0)
          setNext(null)
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [activeCategory, search])

  function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    getCourses({ search, category: activeCategory === 'all' ? undefined : activeCategory, page: nextPage })
      .then((data) => {
        setCourses((prev) => [...prev, ...(data.results ?? [])])
        setNext(data.next ?? null)
        setPage(nextPage)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  async function handleEnroll(course) {
    setEnrollingId(course.id)
    try {
      await enrollInCourse(course.id, accessToken)
      setEnrolledCourseIds((prev) => new Set(prev).add(course.id))
    } catch (err) {
      if (err.message?.toLowerCase().includes('already enrolled')) {
        setEnrolledCourseIds((prev) => new Set(prev).add(course.id))
      }
    } finally {
      setEnrollingId(null)
    }
  }

  const categoryOptions = useMemo(
    () => [{ id: 'all', slug: 'all', name: t('dashboardStudent.browseCourses.allCategories'), course_count: count }, ...categories],
    [categories, count, t],
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('dashboardStudent.browseCourses.heading')}</h1>
        <p className="mt-1 text-sm text-navy-700/55 dark:text-navy-100/55">
          {t('dashboardStudent.browseCourses.availableSummary', { count, categoryCount: categories.length })}
        </p>
      </div>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('dashboardStudent.browseCourses.searchPlaceholder')}
          className="w-full max-w-md rounded-full border border-navy-900/10 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActiveCategory(cat.slug)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              activeCategory === cat.slug
                ? 'bg-navy-900 text-white dark:bg-brand-500'
                : 'bg-white text-navy-700/70 ring-1 ring-navy-900/8 hover:bg-navy-50 dark:bg-navy-800 dark:text-navy-100/70 dark:ring-white/10 dark:hover:bg-white/5'
            }`}
          >
            {cat.name}
            {cat.slug !== 'all' && ` (${cat.course_count})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700/50 dark:bg-white/5 dark:text-navy-100/50">
            <IconSearch className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-navy-900 dark:text-white">{t('dashboardStudent.browseCourses.noCoursesFound')}</h3>
          <p className="mt-1 max-w-sm text-sm text-navy-700/55 dark:text-navy-100/55">
            {search ? t('dashboardStudent.browseCourses.noCoursesMatching', { search }) : t('dashboardStudent.browseCourses.noCoursesInCategory')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => {
              const enrolled = enrolledCourseIds.has(c.id)
              return (
                <div
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 transition-shadow hover:shadow-lg hover:shadow-navy-900/5 dark:bg-navy-800 dark:ring-white/10"
                >
                  <Link to={`/courses/${c.slug}`} className="relative block h-32 overflow-hidden bg-navy-900">
                    {c.image ? (
                      <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconBook className="h-8 w-8 text-white/15" />
                      </div>
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold capitalize text-navy-900">
                      {c.level}
                    </span>
                    {c.is_free && (
                      <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                        {t('dashboardStudent.browseCourses.free')}
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
                      {c.category?.name ?? t('dashboardStudent.browseCourses.generalCategory')}
                    </p>
                    <Link to={`/courses/${c.slug}`} className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-navy-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                      {c.title}
                    </Link>
                    <p className="mt-1 text-xs text-navy-700/50 dark:text-navy-100/50">{c.instructor?.full_name}</p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-navy-700/55 dark:text-navy-100/55">
                      <span className="inline-flex items-center gap-1">
                        <IconClipboard className="h-3.5 w-3.5" />
                        {c.duration_hours}h
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IconStar className="h-3.5 w-3.5 text-amber-400" />
                        {c.average_rating ?? '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IconUsers className="h-3.5 w-3.5" />
                        {c.enrolled_count}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-navy-900/8 pt-3.5 dark:border-white/10">
                      <span className="text-sm font-bold text-navy-900 dark:text-white">{c.is_free ? t('dashboardStudent.browseCourses.free') : formatCurrency(c.price)}</span>
                      {enrolled ? (
                        <Link
                          to={`/learn/${c.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        >
                          <IconCheck className="h-3.5 w-3.5" /> {t('dashboardStudent.browseCourses.enrolled')}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnroll(c)}
                          disabled={enrollingId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
                        >
                          {enrollingId === c.id ? t('dashboardStudent.browseCourses.enrolling') : t('dashboardStudent.browseCourses.enroll')}
                          {enrollingId !== c.id && <IconArrowRight className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {next && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 disabled:opacity-60 dark:bg-navy-800 dark:text-white dark:ring-white/15 dark:hover:bg-white/5"
              >
                {loadingMore ? t('dashboardStudent.browseCourses.loading') : t('dashboardStudent.browseCourses.loadMore')}
                {!loadingMore && <IconArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
