import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPlatformStats } from '../lib/queries'
import { IconArrowRight, IconAward, IconBook, IconCheck, IconSearch, IconStar, IconTrendingUp, IconUsers } from './icons'

// Shown immediately, before the real numbers load — never negative-of-truth
// (rounded down, "+"-suffixed) so a flash of stale copy never overstates.
const fallbackStats = [
  { value: '100+', label: 'Courses' },
  { value: '100+', label: 'Students' },
  { value: '50+', label: 'Instructors' },
  { value: '—', label: 'Completion rate' },
]

function formatCount(n) {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`
  return `${Math.floor(n / 10) * 10}+`
}

const popularSearches = [
  'Web Development',
  'Data Science',
  'Digital Marketing',
  'Accounting',
  'French',
]

const activity = [30, 55, 40, 70, 50, 85, 60]

export default function Hero() {
  const [query, setQuery] = useState('')
  const [stats, setStats] = useState(fallbackStats)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getPlatformStats()
      .then((data) => {
        if (cancelled) return
        setStats([
          { value: formatCount(data.course_count), label: 'Courses' },
          { value: formatCount(data.student_count), label: 'Students' },
          { value: formatCount(data.instructor_count), label: 'Instructors' },
          { value: `${data.completion_rate}%`, label: 'Completion rate' },
        ])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  function runSearch(term) {
    const q = term.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}#courses` : '/#courses')
  }

  function handleSubmit(e) {
    e.preventDefault()
    runSearch(query)
  }

  function handlePopularSearch(term) {
    setQuery(term)
    runSearch(term)
  }

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(47,95,255,0.10), transparent 40%), radial-gradient(circle at 85% 0%, rgba(124,58,237,0.08), transparent 45%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pt-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:pt-28">
        {/* Left: message + conversion */}
        <div className="text-center lg:text-left">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-navy-900/8">
            <IconStar className="h-4 w-4 text-brand-500" />
            Learn skills. Build your future.
          </div>

          <h1 className="animate-fade-up mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy-900 [animation-delay:80ms] sm:text-5xl lg:text-6xl">
            Master the skills that
            <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-brand-500 bg-clip-text text-transparent">
              {' '}
              move your career forward
            </span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-700/70 [animation-delay:160ms] lg:mx-0">
            Learn practical, industry-relevant skills from experienced instructors, build
            real-world projects, and turn what you learn into career opportunities.
          </p>

          <div className="animate-fade-up mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3 [animation-delay:220ms] lg:mx-0 lg:justify-start">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl"
            >
              Start Learning
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-navy-800 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
            >
              Explore Courses
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-fade-up mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-navy-900/10 ring-1 ring-navy-900/8 [animation-delay:280ms] sm:flex-row sm:rounded-full lg:mx-0"
          >
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <IconSearch className="h-5 w-5 shrink-0 text-navy-700/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to learn today?"
                className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-700/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Search
            </button>
          </form>

          <div className="animate-fade-up mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs [animation-delay:320ms] lg:mx-0 lg:justify-start">
            <span className="text-navy-700/45">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handlePopularSearch(term)}
                className="rounded-full px-3 py-1 font-medium text-navy-700/70 ring-1 ring-navy-900/10 transition-colors hover:bg-navy-50 hover:text-navy-900"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Right: product visual — a stylized composition of the actual app, not a stock photo */}
        <div className="animate-fade-up relative mx-auto hidden w-full max-w-md [animation-delay:200ms] lg:block">
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-3 ring-1 ring-navy-900/8">
            <div className="rounded-xl bg-white p-5 shadow-2xl shadow-navy-900/10 ring-1 ring-navy-900/5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] font-semibold text-navy-700/40">My Dashboard</span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-navy-50 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                    <IconBook className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Full-Stack Web Development</p>
                    <p className="text-[11px] text-navy-700/50">Module 4 of 6 &middot; React APIs</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-500">72%</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-navy-900/8">
                <div className="h-1.5 w-[72%] rounded-full bg-gradient-to-r from-brand-500 to-violet-400" />
              </div>

              <div className="mt-5 flex items-end gap-1.5">
                {activity.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500 to-violet-300"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-navy-700/40">This week&rsquo;s learning activity</p>

              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <IconCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-navy-900">Quiz submitted</p>
                  <p className="text-[11px] text-navy-700/50">React State Management &middot; 92%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -left-8 -top-6 w-48 rounded-2xl bg-white p-4 shadow-2xl shadow-navy-900/15 ring-1 ring-navy-900/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <IconAward className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">Certificate earned</p>
                <p className="text-[11px] text-navy-700/55">Data Science Path</p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -bottom-8 -right-6 w-48 rounded-2xl bg-white p-4 shadow-2xl shadow-navy-900/15 ring-1 ring-navy-900/5 [animation-delay:1.5s]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                <IconTrendingUp className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-navy-900">12-day streak</p>
                <p className="flex items-center gap-1 text-[11px] text-navy-700/55">
                  <IconUsers className="h-3 w-3" /> 2,438 learners today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <dl className="animate-fade-up mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-navy-900/8 pt-8 text-center [animation-delay:360ms] sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-bold text-navy-900 sm:text-3xl">{s.value}</dd>
              <div className="mt-1 text-sm text-navy-700/55">{s.label}</div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
