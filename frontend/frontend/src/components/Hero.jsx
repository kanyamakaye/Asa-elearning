import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getPlatformStats } from '../lib/queries'
import HeroIllustration from './HeroIllustration'
import { IconArrowRight, IconAward, IconSearch, IconStar, IconTrendingUp, IconUsers } from './icons'

function formatCount(n) {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`
  return `${Math.floor(n / 10) * 10}+`
}

const popularSearchKeys = ['webDevelopment', 'dataScience', 'digitalMarketing', 'accounting', 'french']

export default function Hero() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [rawStats, setRawStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getPlatformStats()
      .then((data) => {
        if (!cancelled) setRawStats(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Shown immediately, before the real numbers load — never negative-of-truth
  // (rounded down, "+"-suffixed) so a flash of stale copy never overstates.
  const stats = [
    { key: 'courses', value: rawStats ? formatCount(rawStats.course_count) : '100+' },
    { key: 'students', value: rawStats ? formatCount(rawStats.student_count) : '100+' },
    { key: 'instructors', value: rawStats ? formatCount(rawStats.instructor_count) : '50+' },
    { key: 'completionRate', value: rawStats ? `${rawStats.completion_rate}%` : '—' },
  ]

  function runSearch(term) {
    const q = term.trim()
    navigate(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses')
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
    <section id="home" className="relative overflow-hidden bg-white dark:bg-navy-950">
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
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-navy-900/8 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-white/10">
            <IconStar className="h-4 w-4 text-brand-500" />
            {t('public.hero.eyebrow')}
          </div>

          <h1 className="animate-fade-up mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy-900 [animation-delay:80ms] dark:text-white sm:text-5xl lg:text-6xl">
            {t('public.hero.headlineStart')}
            <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-brand-500 bg-clip-text text-transparent">
              {' '}
              {t('public.hero.headlineEnd')}
            </span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-700/70 [animation-delay:160ms] dark:text-navy-100/70 lg:mx-0">
            {t('public.hero.subhead')}
          </p>

          <div className="animate-fade-up mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3 [animation-delay:220ms] lg:mx-0 lg:justify-start">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              {t('public.hero.primaryCta')}
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-navy-800 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 dark:text-navy-100 dark:ring-white/15 dark:hover:bg-white/5"
            >
              {t('public.hero.secondaryCta')}
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-fade-up mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-navy-900/10 ring-1 ring-navy-900/8 [animation-delay:280ms] dark:bg-navy-900 dark:ring-white/10 sm:flex-row sm:rounded-full lg:mx-0"
          >
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <IconSearch className="h-5 w-5 shrink-0 text-navy-700/40 dark:text-navy-100/40" />
              <label htmlFor="hero-course-search" className="sr-only">
                {t('public.hero.searchLabel')}
              </label>
              <input
                id="hero-course-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('public.hero.searchPlaceholder')}
                className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-700/40 focus:outline-none dark:text-white dark:placeholder:text-navy-100/40"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              {t('public.hero.searchButton')}
            </button>
          </form>

          <div className="animate-fade-up mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs [animation-delay:320ms] lg:mx-0 lg:justify-start">
            <span className="text-navy-700/45 dark:text-navy-100/45">{t('public.hero.popularLabel')}</span>
            {popularSearchKeys.map((key) => {
              const term = t(`public.hero.popularSearches.${key}`)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePopularSearch(term)}
                  className="rounded-full px-3 py-1 font-medium text-navy-700/70 ring-1 ring-navy-900/10 transition-colors hover:bg-navy-50 hover:text-navy-900 dark:text-navy-100/70 dark:ring-white/15 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {term}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: product visual — a custom illustration plus two floating
            stat cards drawn from the real product, not a stock photo */}
        <div className="animate-fade-up relative mx-auto hidden w-full max-w-md [animation-delay:200ms] lg:block">
          <HeroIllustration className="w-full" />

          <div className="animate-float absolute -left-8 -top-6 w-48 rounded-2xl bg-white p-4 shadow-2xl shadow-navy-900/15 ring-1 ring-navy-900/5 dark:bg-navy-800 dark:ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300">
                <IconAward className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900 dark:text-white">{t('public.hero.certCardTitle')}</p>
                <p className="text-[11px] text-navy-700/55 dark:text-navy-100/55">{t('public.hero.certCardSubtitle')}</p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -bottom-8 -right-6 w-48 rounded-2xl bg-white p-4 shadow-2xl shadow-navy-900/15 ring-1 ring-navy-900/5 dark:bg-navy-800 dark:ring-white/10 [animation-delay:1.5s]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-500/15 dark:text-violet-300">
                <IconTrendingUp className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-navy-900 dark:text-white">{t('public.hero.streakCardTitle')}</p>
                <p className="flex items-center gap-1 text-[11px] text-navy-700/55 dark:text-navy-100/55">
                  <IconUsers className="h-3 w-3" /> {t('public.hero.streakCardSubtitle', { count: '2,438' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <dl className="animate-fade-up mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-navy-900/8 pt-8 text-center [animation-delay:360ms] dark:border-white/10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key}>
              <dt className="sr-only">{t(`public.hero.stats.${s.key}`)}</dt>
              <dd className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">{s.value}</dd>
              <div className="mt-1 text-sm text-navy-700/55 dark:text-navy-100/55">{t(`public.hero.stats.${s.key}`)}</div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
