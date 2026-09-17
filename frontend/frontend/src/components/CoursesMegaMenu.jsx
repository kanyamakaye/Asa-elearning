import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getCourses } from '../lib/queries'
import { CATEGORY_ICONS } from './CategoryExplorer'
import { IconArrowRight, IconChevronDown, IconTarget } from './icons'

/** The navbar's "Courses" link, upgraded into a hoverable mega-menu —
 * categories on the left, a live preview of that category's courses on the
 * right (see sample.md: Alison.com's Explore dropdown). Course previews are
 * fetched lazily per category and cached, so hovering around doesn't
 * re-fetch anything already seen. */
export default function CoursesMegaMenu() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [activeSlug, setActiveSlug] = useState(null)
  const [coursesByCategory, setCoursesByCategory] = useState({})
  const [loadingCourses, setLoadingCourses] = useState(false)
  const closeTimer = useRef(null)

  useEffect(() => {
    getCategories()
      .then((data) => {
        const list = data.results ?? data
        setCategories(list)
        if (list.length) setActiveSlug(list[0].slug)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeSlug || coursesByCategory[activeSlug]) return
    setLoadingCourses(true)
    getCourses({ category: activeSlug, page: 1 })
      .then((data) => {
        setCoursesByCategory((prev) => ({ ...prev, [activeSlug]: (data.results ?? data).slice(0, 5) }))
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug])

  function handleEnter() {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const activeCategory = categories.find((c) => c.slug === activeSlug)
  const activeCourses = activeSlug ? coursesByCategory[activeSlug] ?? [] : []

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        to="/#courses"
        className="flex items-center gap-1 text-sm font-medium text-navy-700/80 transition-colors hover:text-brand-500"
      >
        Courses
        <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Link>

      {open && categories.length > 0 && (
        <div className="absolute left-1/2 top-full z-40 mt-3 w-[680px] -translate-x-1/2 rounded-2xl bg-white p-2 shadow-2xl shadow-navy-900/15 ring-1 ring-navy-900/8">
          <div className="grid grid-cols-[260px_1fr]">
            <div className="space-y-0.5 border-r border-navy-900/8 pr-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? IconTarget
                const isActive = cat.slug === activeSlug
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseEnter={() => setActiveSlug(cat.slug)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive ? 'bg-brand-50 text-navy-900' : 'text-navy-700/75 hover:bg-navy-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand-500" />
                    <span className="min-w-0 flex-1 truncate font-semibold">{cat.name}</span>
                    <span className="shrink-0 text-xs text-navy-700/45">{cat.course_count}</span>
                  </button>
                )
              })}
            </div>

            <div className="p-3">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-navy-700/45">
                Top {activeCategory?.name ?? ''} courses
              </p>
              <div className="mt-2 space-y-0.5">
                {loadingCourses ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 animate-pulse rounded-lg bg-navy-50" />
                  ))
                ) : activeCourses.length === 0 ? (
                  <p className="px-1 py-4 text-sm text-navy-700/45">No courses yet in this category.</p>
                ) : (
                  activeCourses.map((c) => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="block truncate rounded-lg px-3 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-navy-50 hover:text-brand-500"
                    >
                      {c.title}
                    </Link>
                  ))
                )}
              </div>
              <Link
                to={`/?category=${activeSlug}#courses`}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-1.5 px-1 text-xs font-semibold text-brand-500 hover:text-navy-900"
              >
                View all {activeCategory?.name ?? ''} courses
                <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
