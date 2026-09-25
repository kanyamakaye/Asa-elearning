import { useLanguage } from '../context/LanguageContext'
import { IconAward, IconBook, IconBriefcase, IconClipboard, IconTrendingUp } from './icons'

const stepConfig = [
  { key: 'learn', icon: IconBook },
  { key: 'practice', icon: IconClipboard },
  { key: 'trackProgress', icon: IconTrendingUp },
  { key: 'getCertified', icon: IconAward },
  { key: 'advance', icon: IconBriefcase },
]

export default function CareerOutcomes() {
  const { t } = useLanguage()

  return (
    <section id="outcomes" className="border-y border-navy-900/8 bg-white py-16 dark:border-white/10 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('public.careerOutcomes.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
            {t('public.careerOutcomes.heading')}
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {stepConfig.map((step, i) => (
            <div key={step.key} className="animate-fade-up relative text-center" style={{ animationDelay: `${i * 100}ms` }}>
              {i < stepConfig.length - 1 && (
                <div className="absolute left-1/2 top-7 hidden h-px w-full bg-navy-900/10 dark:bg-white/10 lg:block" />
              )}
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm ring-1 ring-navy-900/8 transition-transform duration-300 hover:scale-110 dark:bg-navy-800 dark:text-brand-300 dark:ring-white/10">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-navy-900 dark:text-white">{t(`public.careerOutcomes.steps.${step.key}.label`)}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-700/55 dark:text-navy-100/55">
                {t(`public.careerOutcomes.steps.${step.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
