import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getCourses } from '../lib/queries'
import { CATEGORY_ICONS } from './CategoryExplorer'
import {
  IconArrowRight,
  IconAward,
  IconBriefcase,
  IconChevronDown,
  IconCreditCard,
  IconTarget,
  IconUsers,
} from './icons'

// Quick-link shortcuts shown in the first column — Alison's "Goals" column,
// adapted to what Asa Academy actually offers (see sample.md).
const quickLinks = [
  { label: 'Explore Courses', to: '/#courses', icon: IconTarget, active: true },
  { label: 'Explore Instructors', to: '/#instructors', icon: IconUsers },
  { label: 'Learning Paths', to: '/#paths', icon: IconAward },
  { label: 'Get Certified', to: '/#outcomes', icon: IconAward },
  { label: 'Pricing & Plans', to: '/#pricing', icon: IconCreditCard },
  { label: 'Become an Instructor', to: '/signup?role=instructor', icon: IconBriefcase },
]

/** The navbar's "Courses" link, upgraded into a three-column mega-menu that
 * mirrors Alison.com's Explore dropdown (see sample.md: quick-link goals on
 * the left, course categories in the middle, a live preview of the
 * hovered category's top courses on the right). Course previews are
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
        setCoursesByCategory((prev) => ({ ...prev, [activeSlug]: (data.results ?? data).slice(0, 8) }))
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
        <div className="absolute left-1/2 top-full z-40 mt-3 w-[840px] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-navy-900/15 ring-1 ring-navy-900/8">
          <div className="grid grid-cols-[220px_290px_1fr]">
            {/* Column 1: quick-link shortcuts */}
            <div className="border-r border-navy-900/8 bg-navy-50/40 p-3">
              <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-navy-700/40">
                Get Started
              </p>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    link.active
                      ? 'bg-white font-semibold text-navy-900 shadow-sm ring-1 ring-navy-900/8'
                      : 'text-navy-700/75 hover:bg-white/70 hover:text-navy-900'
                  }`}
                >
                  <link.icon className="h-4 w-4 shrink-0 text-brand-500" />
                  <span className="flex-1 truncate">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Column 2: course categories */}
            <div className="border-r border-navy-900/8 p-3">
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-700/40">
                  Course Categories
                </p>
                <Link
                  to="/#courses"
                  onClick={() => setOpen(false)}
                  className="shrink-0 text-xs font-semibold text-brand-500 hover:text-navy-900"
                >
                  View all
                </Link>
              </div>
              <div className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.slug] ?? IconTarget
                  const isActive = cat.slug === activeSlug
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setActiveSlug(cat.slug)}
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors ${
                        isActive ? 'bg-brand-50 text-navy-900' : 'text-navy-700/80 hover:bg-navy-50'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isActive ? 'bg-brand-500 text-white' : 'bg-navy-50 text-brand-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{cat.name}</span>
                        <span className="block text-xs text-navy-700/45">
                          {cat.course_count} course{cat.course_count === 1 ? '' : 's'}
                        </span>
                      </span>
                      <IconChevronDown className={`h-3.5 w-3.5 shrink-0 -rotate-90 ${isActive ? 'text-brand-500' : 'text-navy-700/30'}`} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Column 3: live preview of the hovered category's top courses */}
            <div className="bg-navy-50/40 p-3">
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <Link
                  to={`/?category=${activeSlug}#courses`}
                  onClick={() => setOpen(false)}
                  className="text-sm font-bold text-brand-600 hover:text-navy-900"
                >
                  Top {activeCategory?.name ?? ''} Courses
                </Link>
              </div>
              <div className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
                {loadingCourses ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="mx-2.5 h-8 animate-pulse rounded-lg bg-white/70" />
                  ))
                ) : activeCourses.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-navy-700/45">No courses yet in this category.</p>
                ) : (
                  activeCourses.map((c) => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="block truncate rounded-lg px-3 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-white hover:text-brand-500"
                    >
                      {c.title}
                    </Link>
                  ))
                )}
              </div>
              <Link
                to={`/?category=${activeSlug}#courses`}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-brand-500 hover:text-navy-900"
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
