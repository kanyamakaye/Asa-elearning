import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCategories, getCourses } from '../lib/queries'
import { formatCurrency } from '../lib/currency'
import {
  IconArrowRight,
  IconBook,
  IconClipboard,
  IconClose,
  IconSearch,
  IconStar,
  IconUsers,
} from './icons'

const badgeStyles = {
  Bestseller: 'bg-amber-400 text-navy-900',
  New: 'bg-brand-500 text-white',
  Free: 'bg-emerald-500 text-white',
}

export default function Courses() {
  const [categories, setCategories] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'all')
  const query = searchParams.get('q') || ''

  const [courses, setCourses] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {})
  }, [])

  // Picks up a ?category= link (e.g. from CategoryExplorer) even when it's
  // just a search-param change on the same route — React Router doesn't
  // remount this component for that, so useState's lazy initializer alone
  // only catches the very first page load.
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    if (urlCategory) setActiveCategory(urlCategory)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPage(1)
    getCourses({ search: query, category: activeCategory === 'all' ? undefined : activeCategory, page: 1 })
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
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory, query])

  function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    getCourses({ search: query, category: activeCategory === 'all' ? undefined : activeCategory, page: nextPage })
      .then((data) => {
        setCourses((prev) => [...prev, ...(data.results ?? [])])
        setNext(data.next ?? null)
        setPage(nextPage)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  function clearSearch() {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  return (
    <section id="courses" className="bg-brand-50/50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Popular courses
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Learn from courses students love
            </h2>
            <p className="mt-2 text-sm text-navy-700/55">
              {count} course{count === 1 ? '' : 's'} across {categories.length} categories
            </p>
          </div>
        </div>

        {query && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 px-5 py-3.5">
            <IconSearch className="h-4 w-4 shrink-0 text-brand-500" />
            <p className="text-sm text-navy-800">
              {count} result{count === 1 ? '' : 's'} for{' '}
              <span className="font-bold">&ldquo;{query}&rdquo;</span>
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-navy-900"
            >
              Clear
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-navy-50 text-navy-700/70 hover:bg-navy-100'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-navy-900 text-white'
                  : 'bg-navy-50 text-navy-700/70 hover:bg-navy-100'
              }`}
            >
              {cat.name} ({cat.course_count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-navy-50" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-14 flex flex-col items-center rounded-2xl border border-dashed border-navy-900/15 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700/50">
              <IconSearch className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">No courses found</h3>
            <p className="mt-1 max-w-sm text-sm text-navy-700/55">
              {query
                ? `We couldn't find any courses matching "${query}".`
                : 'No courses have been published in this category yet.'}
            </p>
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.slug}`}
                  className="group animate-fade-up flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-navy-900/10"
                  style={{ animationDelay: `${(i % 6) * 70}ms` }}
                >
                  <div className="relative h-36 overflow-hidden bg-navy-900">
                    {c.image ? (
                      <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconBook className="h-10 w-10 text-white/15" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/10" />
                    <div className="relative flex items-start justify-between p-4">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-navy-900">
                        {c.level}
                      </span>
                      {c.is_free && (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyles.Free}`}>
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      {c.category?.name ?? 'General'}
                    </p>
                    <h3 className="mt-2 text-base font-bold leading-snug text-navy-900">
                      {c.title}
                    </h3>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700">
                        {c.instructor?.full_name?.[0] ?? '?'}
                      </div>
                      <span className="text-sm text-navy-700/70">{c.instructor?.full_name}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-navy-700/55">
                      <span className="inline-flex items-center gap-1">
                        <IconClipboard className="h-3.5 w-3.5" />
                        {c.duration_hours}h
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-navy-900/8 pt-4 text-sm">
                      <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
                        <IconStar className="h-3.5 w-3.5 text-amber-400" />
                        {c.average_rating ?? '—'}
                      </span>
                      <span className="font-bold text-navy-900">
                        {c.is_free ? 'Free' : formatCurrency(c.price)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-xs text-navy-700/55">
                      <IconUsers className="h-3.5 w-3.5" />
                      {c.enrolled_count} students enrolled
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {next && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 disabled:opacity-60"
                >
                  {loadingMore ? 'Loading…' : 'Load More Courses'}
                  {!loadingMore && <IconArrowRight className="h-4 w-4" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
