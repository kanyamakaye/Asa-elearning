import { useLanguage } from '../context/LanguageContext'

const stepKeys = ['createAccount', 'browseEnroll', 'learnAtPace', 'earnCertificate']

export default function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section id="about" className="border-y border-navy-900/8 bg-white py-16 dark:border-white/10 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('public.howItWorks.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
            {t('public.howItWorks.heading')}
          </h2>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stepKeys.map((key, i) => (
            <div key={key} className="animate-fade-up relative" style={{ animationDelay: `${i * 100}ms` }}>
              {i < stepKeys.length - 1 && (
                <div className="absolute left-6 top-6 hidden h-px w-full -translate-x-0 bg-navy-900/10 dark:bg-white/10 lg:block" />
              )}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm shadow-brand-500/30 transition-transform duration-300 hover:scale-110">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy-900 dark:text-white">{t(`public.howItWorks.steps.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-700/60 dark:text-navy-100/60">
                {t(`public.howItWorks.steps.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
