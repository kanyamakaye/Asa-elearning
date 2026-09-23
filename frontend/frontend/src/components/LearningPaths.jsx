import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../lib/queries'
import { IconArrowRight } from './icons'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function LearningPaths() {
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
    <section id="paths" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Learning paths
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Don&rsquo;t just take a course. Follow a path.
          </h2>
          <p className="mt-4 text-lg text-navy-700/70">
            Every category is structured from beginner to advanced, so you always know
            what to learn next.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-navy-50" />
              ))
            : categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  to="/courses"
                  className="group animate-fade-up flex flex-col rounded-2xl border border-navy-900/8 p-6 transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-navy-900/5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <h3 className="text-base font-bold text-navy-900">{cat.name}</h3>
                  <p className="mt-1 text-xs text-navy-700/50">{cat.course_count} courses</p>

                  <ul className="mt-5 flex-1 space-y-3">
                    {LEVELS.map((level, i) => (
                      <li key={level} className="flex items-center gap-2.5 text-sm">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            i === 0
                              ? 'bg-brand-500 text-white'
                              : 'bg-navy-100 text-navy-700/60 group-hover:bg-brand-100 group-hover:text-brand-600'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-navy-700/75">{level}</span>
                      </li>
                    ))}
                  </ul>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500">
                    Start this path
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
