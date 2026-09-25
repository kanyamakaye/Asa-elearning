import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getCourses } from '../lib/queries'
import useCurrency from '../hooks/useCurrency'
import { IconArrowRight, IconBook, IconClipboard, IconStar, IconUsers } from './icons'

const PREVIEW_COUNT = 6

// A short curated preview, not the full catalog — the full filterable,
// paginated course browser now lives at /courses (see CoursesCatalog.jsx).
// Embedding that entire experience here used to stretch this section past
// 3000px (a full category browser + infinite "Load More" inside a homepage
// teaser), which read as bloated, repetitive dead space rather than a
// focused "here's what's popular" moment.
export default function Courses() {
  const { t } = useLanguage()
  const formatCurrency = useCurrency()
  const [courses, setCourses] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCourses({ pageSize: PREVIEW_COUNT })
      .then((data) => {
        if (cancelled) return
        setCourses((data.results ?? data).slice(0, PREVIEW_COUNT))
        setCount(data.count ?? (data.results ?? data).length)
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([])
          setCount(0)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loading && courses.length === 0) return null

  return (
    <section id="courses" className="bg-brand-50/50 py-16 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('public.courses.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
              {t('public.courses.heading')}
            </h2>
            <p className="mt-2 text-sm text-navy-700/55 dark:text-navy-100/55">
              {count > PREVIEW_COUNT ? t('public.courses.subheadWithCount', { count }) : t('public.courses.subhead')}
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white"
          >
            {t('public.courses.viewAll')}
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/70 dark:bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <Link
                key={c.id}
                to={`/courses/${c.slug}`}
                className="group animate-fade-up flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-navy-900/10 dark:bg-navy-900 dark:ring-white/10"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="relative h-36 overflow-hidden bg-navy-900">
                  {/* Always-present fallback — if the image URL fails or is
                      blocked (common for hot-linked stock-photo CDNs), the
                      onError handler below hides the <img> and this shows
                      through instead of a blank rectangle. */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconBook className="h-10 w-10 text-white/15" />
                  </div>
                  {c.image && (
                    <img
                      src={c.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/10" />
                  <div className="relative flex items-start justify-between p-4">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-navy-900">
                      {c.level}
                    </span>
                    {c.is_free && (
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                        {t('public.courses.free')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    {c.category?.name ?? t('public.courses.generalCategory')}
                  </p>
                  <h3 className="mt-2 text-base font-bold leading-snug text-navy-900 dark:text-white">
                    {c.title}
                  </h3>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700 dark:bg-white/10 dark:text-navy-100">
                      {c.instructor?.full_name?.[0] ?? '?'}
                    </div>
                    <span className="text-sm text-navy-700/70 dark:text-navy-100/70">{c.instructor?.full_name}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-navy-700/55 dark:text-navy-100/55">
                    <span className="inline-flex items-center gap-1">
                      <IconClipboard className="h-3.5 w-3.5" />
                      {t('public.courses.hours', { count: c.duration_hours })}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-navy-900/8 pt-4 text-sm dark:border-white/10">
                    <span className="inline-flex items-center gap-1 font-semibold text-navy-900 dark:text-white">
                      <IconStar className="h-3.5 w-3.5 text-amber-400" />
                      {c.average_rating ?? '—'}
                    </span>
                    <span className="font-bold text-navy-900 dark:text-white">
                      {c.is_free ? t('public.courses.free') : formatCurrency(c.price)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-navy-700/55 dark:text-navy-100/55">
                    <IconUsers className="h-3.5 w-3.5" />
                    {t('public.courses.studentsEnrolled', { count: c.enrolled_count })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
