import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { IconClock } from '../icons'

function formatTime(value) {
  if (!value) return ''
  return value.slice(0, 5)
}

export default function UpcomingLiveClasses({ items = [], emptyMessage }) {
  const { t } = useLanguage()
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900 dark:text-white">{t('dashboardChrome.upcomingLiveClasses.title')}</h3>
        <Link to="/dashboard/live-classes" className="text-xs font-semibold text-brand-500 hover:underline">
          {t('dashboardChrome.upcomingLiveClasses.viewAll')}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 pb-2 text-center text-sm text-navy-700/45 dark:text-navy-100/45">
          {emptyMessage || t('dashboardChrome.upcomingLiveClasses.empty')}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-navy-900/6 dark:divide-white/5">
          {items.map((item) => {
            const date = item.scheduled_date ? new Date(item.scheduled_date) : null
            const instructor = `${item.instructor__first_name ?? ''} ${item.instructor__last_name ?? ''}`.trim()
            return (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 leading-none text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <span className="text-[10px] font-bold uppercase">
                    {date ? date.toLocaleDateString(undefined, { month: 'short' }) : '—'}
                  </span>
                  <span className="mt-0.5 text-sm font-extrabold">{date ? date.getDate() : ''}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-800 dark:text-navy-100">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-navy-700/50 dark:text-navy-100/50">{item.course__title}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs text-navy-700/45 dark:text-navy-100/45">
                      <IconClock className="h-3 w-3" />
                      {formatTime(item.start_time)}
                      {item.end_time ? ` – ${formatTime(item.end_time)}` : ''}
                    </span>
                    {instructor && <span className="truncate text-xs text-navy-700/45 dark:text-navy-100/45">{instructor}</span>}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
