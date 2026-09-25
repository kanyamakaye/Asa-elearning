import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getInstructors } from '../lib/queries'
import { IconArrowRight, IconLinkedIn, IconStar, IconUsers } from './icons'

// Card layout follows team.md's reference (gradient block + framed photo +
// LinkedIn badge) — restyled with the site's own brand/violet gradient
// rather than copied colors, and the LinkedIn badge only renders when an
// instructor has actually set instructor_profile.linkedin_url (no
// decorative dead links).
export default function Instructors() {
  const { t } = useLanguage()
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
    <section id="instructors" className="bg-white py-16 dark:bg-navy-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('public.instructors.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
              {t('public.instructors.heading')}
            </h2>
          </div>
          <a
            href="#courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white"
          >
            {t('public.instructors.viewAll')}
            <IconArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-navy-50 dark:bg-white/5" />
              ))
            : instructors.map((person, i) => (
                <div
                  key={person.id}
                  className="group animate-fade-up overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10 dark:bg-navy-800 dark:ring-white/10"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="relative bg-gradient-to-br from-brand-500 to-violet-500 pb-10 pt-7">
                    {person.linkedin_url && (
                      <a
                        href={person.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t('public.instructors.linkedinLabel', { name: person.full_name })}
                        className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm transition-transform hover:scale-110"
                      >
                        <IconLinkedIn className="h-4 w-4" />
                      </a>
                    )}

                    {/* Fallback initials avatar sits underneath and always renders —
                        if profile_picture 404s or is blocked, onError hides the
                        <img> and this shows through instead of a blank box. */}
                    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl bg-navy-900 ring-4 ring-white/90">
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                        {person.full_name?.[0] ?? '?'}
                      </div>
                      {person.profile_picture && (
                        <img
                          src={person.profile_picture}
                          alt={person.full_name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="p-5 text-center">
                    <h3 className="text-base font-bold text-navy-900 dark:text-white">{person.full_name}</h3>
                    <p className="mt-1 text-xs font-semibold text-brand-500">{person.title}</p>

                    <div className="mt-4 flex items-center justify-center gap-4 border-t border-navy-900/8 pt-4 text-xs text-navy-700/65 dark:border-white/10 dark:text-navy-100/60">
                      <span className="inline-flex items-center gap-1">
                        <IconUsers className="h-3.5 w-3.5" />
                        {person.student_count}
                      </span>
                      <span>{t('public.instructors.courseCount', { count: person.course_count })}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-navy-900 dark:text-white">
                        <IconStar className="h-3.5 w-3.5 text-amber-400" />
                        {person.average_rating ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
