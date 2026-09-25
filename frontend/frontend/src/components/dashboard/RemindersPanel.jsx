import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { IconArrowRight, IconBell, IconCreditCard, IconVideo } from '../icons'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const ROW_CONFIG = [
  {
    key: 'upcoming_live_classes',
    icon: IconVideo,
    accent: 'text-brand-500 bg-brand-50 dark:bg-brand-500/15',
    to: '/dashboard/live-classes',
  },
  {
    key: 'inactive_courses',
    icon: IconBell,
    accent: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400',
    to: '/dashboard/my-courses',
  },
  {
    key: 'unresolved_payments',
    icon: IconCreditCard,
    accent: 'text-red-600 bg-red-50 dark:bg-red-500/15 dark:text-red-400',
    to: '/dashboard/payments',
  },
]

export default function RemindersPanel({ reminders }) {
  const { t } = useLanguage()

  function renderItem(key, item) {
    if (key === 'upcoming_live_classes') {
      return {
        title: item.title,
        detail: t('dashboardChrome.reminders.liveClassDetail', {
          course: item.course__title,
          date: formatDate(item.scheduled_date),
          time: item.start_time ? t('dashboardChrome.reminders.atTime', { time: item.start_time.slice(0, 5) }) : '',
        }),
      }
    }
    if (key === 'inactive_courses') {
      return {
        title: item.course_title,
        detail: t('dashboardChrome.reminders.inactiveCourseDetail', {
          percent: Math.round(item.progress_percentage),
          date: formatDate(item.last_activity),
        }),
      }
    }
    return {
      title: item.course__title,
      detail: `${item.amount} ${item.currency} · ${item.payment_status}`,
    }
  }

  const sections = ROW_CONFIG.map((row) => ({ ...row, items: reminders?.[row.key] ?? [] })).filter(
    (row) => row.items.length > 0
  )

  if (sections.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <div className="mb-4 flex items-center gap-2">
        <IconBell className="h-4 w-4 text-brand-500" />
        <h3 className="text-sm font-bold text-navy-900 dark:text-white">{t('dashboardChrome.reminders.title')}</h3>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.key}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy-700/45 dark:text-navy-100/45">
                {t(`dashboardChrome.reminders.sections.${section.key}`)}
              </span>
              <Link to={section.to} className="text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
                {t(`dashboardChrome.reminders.ctas.${section.key}`)} &rarr;
              </Link>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, i) => {
                const { title, detail } = renderItem(section.key, item)
                return (
                  <li key={i} className="flex items-center gap-3 rounded-xl bg-navy-50/50 px-3 py-2.5 dark:bg-white/5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${section.accent}`}>
                      <section.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{title}</p>
                      <p className="truncate text-xs text-navy-700/55 dark:text-navy-100/55">{detail}</p>
                    </div>
                    <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-navy-700/30 dark:text-navy-100/30" />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
