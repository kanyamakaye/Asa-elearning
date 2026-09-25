import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import PortalIllustration from './PortalIllustration'
import { IconCheck, IconLogin, IconSend } from './icons'

const pointKeys = ['courses', 'grades', 'certificates']

export default function StudentPortal() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-brand-50 py-20 dark:bg-navy-900">
      {/* Soft ring in the top-left corner */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[28px] border-brand-100 dark:border-white/5" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300">
            {t('public.studentPortal.eyebrow')}
          </p>
          <h2 className="mt-3 text-4xl tracking-tight text-navy-900 sm:text-5xl dark:text-white">
            {t('public.studentPortal.heading')}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-700/70 dark:text-navy-100/70">
            {t('public.studentPortal.description')}
          </p>

          <ul className="mt-8 grid gap-4">
            {pointKeys.map((key) => (
              <li key={key} className="flex items-center gap-3 text-navy-900 dark:text-navy-50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-emerald-500 text-emerald-600 dark:text-emerald-400">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-base">{t(`public.studentPortal.points.${key}`)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition-transform hover:-translate-y-0.5"
            >
              <IconSend className="h-5 w-5" />
              {t('public.studentPortal.getStarted')}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-medium text-navy-900 ring-1 ring-navy-900/10 transition-colors hover:bg-brand-50 dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/15"
            >
              <IconLogin className="h-5 w-5" />
              {t('public.studentPortal.logIn')}
            </Link>
          </div>
        </div>

        <PortalIllustration
          className="mx-auto w-full max-w-md"
          label={t('public.studentPortal.illustrationAlt')}
        />
      </div>
    </section>
  )
}
