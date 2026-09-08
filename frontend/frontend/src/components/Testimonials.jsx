import { useEffect, useState } from 'react'
import { testimonials as fallbackTestimonials } from '../data/content'
import { getTestimonials } from '../lib/queries'
import { IconStar } from './icons'

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getTestimonials(6)
      .then((data) => {
        if (cancelled) return
        const results = data.results ?? data
        setTestimonials(
          results.map((r) => ({
            quote: r.review_text,
            name: r.student?.full_name ?? 'Asa Academy student',
            role: r.category_name ? `Student, ${r.category_name}` : r.course_title,
            initials: initialsOf(r.student?.full_name),
            rating: r.rating ?? 5,
          })),
        )
      })
      // No reviews yet (fresh install) or the request failed — fall back to
      // curated placeholder copy rather than showing an empty section.
      .catch(() => setTestimonials(fallbackTestimonials))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const shown = loading ? [] : testimonials.length > 0 ? testimonials : fallbackTestimonials

  return (
    <section className="bg-brand-50/50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Loved by students and instructors
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
              ))
            : shown.map((t, i) => (
                <figure
                  key={`${t.name}-${i}`}
                  className="animate-fade-up flex flex-col rounded-2xl bg-white p-7 ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <IconStar key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy-700/80">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900">{t.name}</p>
                      <p className="text-xs text-navy-700/55">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
        </div>
      </div>
    </section>
  )
}
