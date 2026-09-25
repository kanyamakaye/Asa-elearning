import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getCategories } from '../lib/queries'
import { IconArrowRight } from './icons'

const LEVEL_KEYS = ['beginner', 'intermediate', 'advanced']

export default function LearningPaths() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories((data.results ?? data).slice(0, 6))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loading && categories.length === 0) return null

  return (
    <section id="paths" className="bg-white py-16 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('public.learningPaths.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
            {t('public.learningPaths.heading')}
          </h2>
          <p className="mt-4 text-lg text-navy-700/70 dark:text-navy-100/70">
            {t('public.learningPaths.subhead')}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-navy-50 dark:bg-white/5" />
              ))
            : categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  to="/courses"
                  className="group animate-fade-up flex flex-col rounded-2xl border border-navy-900/8 p-6 transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-navy-900/5 dark:border-white/10 dark:hover:border-brand-400/50"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <h3 className="text-base font-bold text-navy-900 dark:text-white">{cat.name}</h3>
                  <p className="mt-1 text-xs text-navy-700/50 dark:text-navy-100/50">
                    {t('public.learningPaths.courseCount', { count: cat.course_count })}
                  </p>

                  <ul className="mt-5 flex-1 space-y-3">
                    {LEVEL_KEYS.map((levelKey, i) => (
                      <li key={levelKey} className="flex items-center gap-2.5 text-sm">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            i === 0
                              ? 'bg-brand-500 text-white'
                              : 'bg-navy-100 text-navy-700/60 group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-white/10 dark:text-navy-100/60 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-300'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-navy-700/75 dark:text-navy-100/75">{t(`public.learningPaths.levels.${levelKey}`)}</span>
                      </li>
                    ))}
                  </ul>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500">
                    {t('public.learningPaths.startPath')}
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
