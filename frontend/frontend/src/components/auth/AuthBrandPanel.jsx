import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { IconChevronLeft, IconStar } from '../icons'
import logo from '../../assets/logo.png'

const STAT_KEYS = ['courses', 'students', 'instructors', 'completionRate']
const STAT_VALUES = { courses: '500+', students: '50k+', instructors: '200+', completionRate: '98%' }

// The left-hand brand panel shared by every full-page auth screen (login,
// signup, ...) — kept in one place so the marketing copy/visual treatment
// stays consistent instead of drifting per page.
export default function AuthBrandPanel({ badge, heading, description }) {
  const { t } = useLanguage()

  return (
    <div className="relative hidden overflow-hidden border-navy-900/8 bg-brand-50/40 dark:border-white/10 dark:bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:border-r lg:px-12 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(47,95,255,0.10), transparent 40%), radial-gradient(circle at 85% 0%, rgba(124,58,237,0.08), transparent 45%)',
        }}
      />

      <div className="relative flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">Asa Academy</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-navy-800 shadow-sm ring-1 ring-navy-900/8 transition-colors hover:bg-navy-50 dark:bg-white/10 dark:text-navy-100 dark:ring-white/10 dark:hover:bg-white/15"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {t('auth.brandPanel.home')}
        </Link>
      </div>

      <div className="relative max-w-md">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-brand-600 shadow-sm ring-1 ring-navy-900/8 dark:bg-white/10 dark:text-brand-300 dark:ring-white/10">
          <IconStar className="h-4 w-4 text-brand-500" />
          {badge}
        </div>
        <h2 className="animate-fade-up mt-6 text-3xl font-extrabold leading-[1.15] tracking-tight text-navy-900 [animation-delay:100ms] dark:text-white">
          {heading}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-navy-700/65 dark:text-navy-100/65">{description}</p>
      </div>

      <dl className="relative grid grid-cols-4 gap-4">
        {STAT_KEYS.map((key) => (
          <div key={key}>
            <dt className="sr-only">{t(`auth.brandPanel.stats.${key}`)}</dt>
            <dd className="text-2xl font-bold text-navy-900 dark:text-white">{STAT_VALUES[key]}</dd>
            <div className="mt-1 text-xs text-navy-700/55 dark:text-navy-100/55">{t(`auth.brandPanel.stats.${key}`)}</div>
          </div>
        ))}
      </dl>
    </div>
  )
}
