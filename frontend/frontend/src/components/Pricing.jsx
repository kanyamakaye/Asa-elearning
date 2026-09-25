import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import useCurrency from '../hooks/useCurrency'
import { IconCheck } from './icons'

const freeKeys = ['fullAccess', 'progressTracking', 'discussions', 'certificate']
const paidKeys = ['everythingFree', 'inDepthCourses', 'lifetimeAccess', 'onePrice']

export default function Pricing() {
  const { t } = useLanguage()
  const formatCurrency = useCurrency()
  return (
    <section id="pricing" className="bg-brand-50/50 py-16 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('public.pricing.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
            {t('public.pricing.heading')}
          </h2>
          <p className="mt-4 text-lg text-navy-700/70 dark:text-navy-100/70">
            {t('public.pricing.subhead')}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="animate-fade-up rounded-3xl bg-white p-8 ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5 dark:bg-navy-900 dark:ring-white/10">
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-700/50 dark:text-navy-100/50">{t('public.pricing.freeTitle')}</p>
            <p className="mt-3 text-4xl font-extrabold text-navy-900 dark:text-white">{formatCurrency(0)}</p>
            <ul className="mt-6 space-y-3">
              {freeKeys.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-navy-700/75 dark:text-navy-100/75">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {t(`public.pricing.freeFeatures.${key}`)}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-8 block rounded-full py-3 text-center text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 dark:text-white dark:ring-white/15 dark:hover:bg-white/5"
            >
              {t('public.pricing.freeCta')}
            </Link>
          </div>

          <div className="animate-fade-up relative rounded-3xl bg-navy-900 p-8 shadow-xl shadow-navy-900/20 transition-all duration-300 [animation-delay:100ms] hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy-900/30">
            <span className="absolute -top-3 left-8 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
              {t('public.pricing.mostPopular')}
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-100/60">{t('public.pricing.paidTitle')}</p>
            <p className="mt-3 text-4xl font-extrabold text-white">{t('public.pricing.perCourse')}</p>
            <ul className="mt-6 space-y-3">
              {paidKeys.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-navy-100/80">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  {t(`public.pricing.paidFeatures.${key}`)}
                </li>
              ))}
            </ul>
            <a
              href="#courses"
              className="mt-8 block rounded-full bg-white py-3 text-center text-sm font-semibold text-navy-900 transition-transform hover:-translate-y-0.5"
            >
              {t('public.pricing.paidCta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
