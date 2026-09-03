import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, courses } from '../data/content'
import {
  IconArrowRight,
  IconClipboard,
  IconClose,
  IconSearch,
  IconStar,
  IconUsers,
} from './icons'

const PAGE_SIZE = 9

const badgeStyles = {
  Bestseller: 'bg-amber-400 text-navy-900',
  New: 'bg-brand-500 text-white',
  Free: 'bg-emerald-500 text-white',
}

const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

export default function Courses() {
  const [activeTab, setActiveTab] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const filtered = useMemo(() => {
    const byTab =
      activeTab === 'all' ? courses : courses.filter((c) => c.categoryId === activeTab)
    if (!query) return byTab

    const q = query.trim().toLowerCase()
    return byTab.filter((c) => {
      const cat = categoryById[c.categoryId]
      return (
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q)
      )
    })
  }, [activeTab, query])
  const visible = filtered.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeTab, query])

  function selectTab(id) {
    setActiveTab(id)
  }

  function clearSearch() {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  return (
    <section id="courses" className="bg-white py-24">
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
              {courses.length} courses across {categories.length} categories
            </p>
          </div>
        </div>

        {query && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 px-5 py-3.5">
            <IconSearch className="h-4 w-4 shrink-0 text-brand-500" />
            <p className="text-sm text-navy-800">
              {filtered.length} result{filtered.length === 1 ? '' : 's'} for{' '}
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
            onClick={() => selectTab('all')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-navy-50 text-navy-700/70 hover:bg-navy-100'
            }`}
          >
            All ({courses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectTab(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === cat.id
                  ? 'bg-navy-900 text-white'
                  : 'bg-navy-50 text-navy-700/70 hover:bg-navy-100'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-14 flex flex-col items-center rounded-2xl border border-dashed border-navy-900/15 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700/50">
              <IconSearch className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">No courses found</h3>
            <p className="mt-1 max-w-sm text-sm text-navy-700/55">
              We couldn&apos;t find any courses matching &ldquo;{query}&rdquo;. Try a
              different keyword or browse all courses.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((c) => {
            const cat = categoryById[c.categoryId]
            return (
              <article
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-2xl ring-1 ring-navy-900/8 transition-shadow hover:shadow-xl hover:shadow-navy-900/10"
              >
                <div className={`relative h-36 overflow-hidden ${cat.color}`}>
                  <img
                    src={cat.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/10" />

                  <div className="relative flex items-start justify-between p-4">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy-900">
                      {c.level}
                    </span>
                    {c.badge && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyles[c.badge]}`}
                      >
                        {c.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    {cat.name}
                  </p>
                  <h3 className="mt-2 text-base font-bold leading-snug text-navy-900">
                    {c.title}
                  </h3>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700">
                      {c.initials}
                    </div>
                    <span className="text-sm text-navy-700/70">{c.instructor}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-navy-700/55">
                    <span className="inline-flex items-center gap-1">
                      <IconClipboard className="h-3.5 w-3.5" />
                      {c.lessons} lessons
                    </span>
                    <span>{c.duration}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-navy-900/8 pt-4 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
                      <IconStar className="h-3.5 w-3.5 text-amber-400" />
                      {c.rating}
                      <span className="font-normal text-navy-700/50">({c.reviews})</span>
                    </span>
                    <span className="font-bold text-navy-900">{c.price}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-navy-700/55">
                    <IconUsers className="h-3.5 w-3.5" />
                    {c.students} students enrolled
                  </div>
                </div>
              </article>
            )
          })}
        </div>

            {visibleCount < filtered.length && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
                >
                  Load More Courses
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
