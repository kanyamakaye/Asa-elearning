import { useEffect, useState } from 'react'
import { getInstructors } from '../lib/queries'
import { IconArrowRight, IconStar, IconUsers } from './icons'

export default function Instructors() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getInstructors()
      .then((data) => {
        // Already ordered by student_count on the backend — keep only the
        // top instructors so the homepage doesn't turn into a full directory.
        if (!cancelled) setInstructors(data.slice(0, 4))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loading && instructors.length === 0) return null

  return (
    <section id="instructors" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Meet the instructors
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Learn from industry experts
            </h2>
          </div>
          <a
            href="#courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-navy-900"
          >
            View all instructors
            <IconArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl bg-navy-50" />
              ))
            : instructors.map((person, i) => (
                <div
                  key={person.id}
                  className="group animate-fade-up rounded-2xl p-6 text-center ring-1 ring-navy-900/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {person.profile_picture ? (
                    <img
                      src={person.profile_picture}
                      alt={person.full_name}
                      className="mx-auto h-20 w-20 rounded-full object-cover ring-1 ring-navy-900/8"
                    />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-white">
                      {person.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <h3 className="mt-4 text-base font-bold text-navy-900">{person.full_name}</h3>
                  <p className="mt-1 text-xs text-navy-700/55">{person.title}</p>

                  <div className="mt-4 flex items-center justify-center gap-4 border-t border-navy-900/8 pt-4 text-xs text-navy-700/65">
                    <span className="inline-flex items-center gap-1">
                      <IconUsers className="h-3.5 w-3.5" />
                      {person.student_count}
                    </span>
                    <span>{person.course_count} courses</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
                      <IconStar className="h-3.5 w-3.5 text-amber-400" />
                      {person.average_rating ?? '—'}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
