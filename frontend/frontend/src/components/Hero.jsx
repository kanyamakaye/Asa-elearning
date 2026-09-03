import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconAward, IconSearch, IconStar, IconUsers } from './icons'

const stats = [
  { value: '500+', label: 'Courses' },
  { value: '50k+', label: 'Students' },
  { value: '200+', label: 'Instructors' },
  { value: '98%', label: 'Completion rate' },
]

const popularSearches = [
  'Web Development',
  'Data Science',
  'Digital Marketing',
  'Accounting',
  'French',
]

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

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
    <section id="home" className="relative overflow-hidden bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(59,107,255,0.35), transparent 40%), radial-gradient(circle at 85% 0%, rgba(111,143,255,0.3), transparent 45%)',
        }}
      />

      {/* decorative floating cards */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute left-[6%] top-24 w-56 rounded-2xl bg-white p-4 shadow-2xl shadow-black/30">
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

        <div className="absolute bottom-16 right-[8%] w-60 rounded-2xl bg-white p-4 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-navy-900">Course progress</p>
            <span className="text-xs font-bold text-brand-500">72%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-navy-900/10">
            <div className="h-1.5 w-[72%] rounded-full bg-gradient-to-r from-brand-500 to-brand-300" />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-navy-700/55">
            <IconUsers className="h-3.5 w-3.5" />
            2,438 learners enrolled
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center lg:px-8 lg:py-28">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-100 ring-1 ring-white/15">
          <IconStar className="h-4 w-4 text-brand-300" />
          Trusted by 50,000+ learners worldwide
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Learn without limits,
          <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            {' '}
            grow with Asa Academy
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-100/70">
          Courses, live classes, quizzes, assignments, progress tracking, and
          verified certificates &mdash; all in one place, free to start.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-black/20 sm:flex-row sm:rounded-full"
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
            Search Courses
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-navy-100/50">Popular:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handlePopularSearch(term)}
              className="rounded-full px-3 py-1 font-medium text-navy-100/70 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
            >
              {term}
            </button>
          ))}
        </div>

        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-bold text-white sm:text-3xl">{s.value}</dd>
              <div className="mt-1 text-sm text-navy-100/60">{s.label}</div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
