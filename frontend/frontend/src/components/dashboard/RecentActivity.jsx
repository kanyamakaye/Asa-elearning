import { useLanguage } from '../../context/LanguageContext'
import {
  IconBook,
  IconCreditCard,
  IconLifeBuoy,
  IconStar,
  IconUsers,
} from '../icons'

const ICONS_BY_TYPE = {
  user_registered: IconUsers,
  course_created: IconBook,
  enrollment: IconStar,
  payment: IconCreditCard,
  support_ticket: IconLifeBuoy,
}

// Plain-English fallback for call sites not yet wired up to LanguageContext
// (see the optional `t` param below) — never crashes, just isn't translated.
function englishFallback(key, vars) {
  if (key === 'dashboardChrome.timeAgo.justNow') return 'just now'
  if (key === 'dashboardChrome.timeAgo.minutes') return `${vars.count}m ago`
  if (key === 'dashboardChrome.timeAgo.hours') return `${vars.count}h ago`
  return `${vars.count}d ago`
}

function timeAgo(isoString, t) {
  if (!isoString) return ''
  const translate = t || englishFallback
  const diffMs = Date.now() - new Date(isoString).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return translate('dashboardChrome.timeAgo.justNow')
  if (minutes < 60) return translate('dashboardChrome.timeAgo.minutes', { count: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return translate('dashboardChrome.timeAgo.hours', { count: hours })
  const days = Math.round(hours / 24)
  if (days < 30) return translate('dashboardChrome.timeAgo.days', { count: days })
  return new Date(isoString).toLocaleDateString()
}

export default function RecentActivity({ items = [], emptyMessage }) {
  const { t } = useLanguage()
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <h3 className="text-sm font-bold text-navy-900 dark:text-white">{t('dashboardChrome.recentActivity.title')}</h3>

      {items.length === 0 ? (
        <p className="mt-6 pb-2 text-center text-sm text-navy-700/45 dark:text-navy-100/45">
          {emptyMessage || t('dashboardChrome.recentActivity.empty')}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-navy-900/6 dark:divide-white/5">
          {items.map((item, i) => {
            const Icon = ICONS_BY_TYPE[item.type] ?? IconStar
            return (
              <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700/60 dark:bg-white/5 dark:text-navy-100/60">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy-800 dark:text-navy-100">{item.title}</p>
                  <p className="mt-0.5 text-xs text-navy-700/45 dark:text-navy-100/45">{timeAgo(item.timestamp, t)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { timeAgo }
