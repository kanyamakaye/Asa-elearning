import { useLanguage } from '../context/LanguageContext'
import {
  IconAward,
  IconChart,
  IconChat,
  IconClipboard,
  IconUsers,
  IconVideo,
} from './icons'

const features = [
  { key: 'liveClasses', icon: IconVideo },
  { key: 'quizzes', icon: IconClipboard },
  { key: 'progress', icon: IconChart },
  { key: 'certificates', icon: IconAward },
  { key: 'discussions', icon: IconChat },
  { key: 'everyRole', icon: IconUsers },
]

export default function Features() {
  const { t } = useLanguage()

  return (
    <section className="bg-white py-16 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('public.features.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
            {t('public.features.heading')}
          </h2>
          <p className="mt-4 text-lg text-navy-700/70 dark:text-navy-100/70">
            {t('public.features.subhead')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.key}
              className="group animate-fade-up rounded-2xl border border-navy-900/8 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5 dark:border-white/10 dark:hover:shadow-black/20"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-navy-900 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300 dark:group-hover:bg-brand-500 dark:group-hover:text-white">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy-900 dark:text-white">{t(`public.features.items.${f.key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-700/65 dark:text-navy-100/65">
                {t(`public.features.items.${f.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
