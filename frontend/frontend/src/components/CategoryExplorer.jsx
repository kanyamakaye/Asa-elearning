import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getCategories } from '../lib/queries'
import {
  IconArrowRight,
  IconBriefcase,
  IconCalculator,
  IconCode,
  IconDatabase,
  IconGlobe,
  IconLaptop,
  IconMegaphone,
  IconTarget,
} from './icons'

// Falls back to IconTarget for any category the seed data doesn't cover —
// new categories still render a card instead of breaking the grid. Exported
// so the Navbar's course mega-menu (CoursesMegaMenu.jsx) can reuse the same
// icon set instead of maintaining a second copy.
export const CATEGORY_ICONS = {
  'information-technology': IconLaptop,
  'software-development': IconCode,
  'data-science': IconDatabase,
  business: IconBriefcase,
  accounting: IconCalculator,
  'digital-marketing': IconMegaphone,
  languages: IconGlobe,
  'professional-development': IconTarget,
}

/** Alison.com-style category exploration grid — a prominent, icon-led way
 * to browse by subject right under the hero, instead of only surfacing
 * categories as filter tabs deep inside the course list (see Courses.jsx). */
export default function CategoryExplorer() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalCourses = categories.reduce((sum, c) => sum + (c.course_count ?? 0), 0)

  if (!loading && categories.length === 0) return null

  return (
    <section className="bg-brand-50/40 py-16 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">{t('public.categoryExplorer.eyebrow')}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
            {totalCourses > 0
              ? t('public.categoryExplorer.headingWithCount', { count: `${totalCourses}+` })
              : t('public.categoryExplorer.heading')}
          </h2>
          <p className="mt-4 text-lg text-navy-700/70 dark:text-navy-100/70">
            {t('public.categoryExplorer.subhead')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-navy-50 dark:bg-white/5" />
              ))
            : categories.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? IconTarget
                return (
                  <Link
                    key={cat.id}
                    to={`/courses?category=${cat.slug}`}
                    className="group animate-fade-up flex flex-col items-start rounded-2xl border border-navy-900/8 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-navy-900/5 dark:border-white/10 dark:hover:border-brand-400/50"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-navy-900 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300 dark:group-hover:bg-brand-500 dark:group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-navy-900 dark:text-white">{cat.name}</h3>
                    <p className="mt-1 text-xs text-navy-700/50 dark:text-navy-100/50">
                      {t('public.categoryExplorer.courseCount', { count: cat.course_count })}
                    </p>
                  </Link>
                )
              })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white"
          >
            {t('public.categoryExplorer.viewAll')}
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
