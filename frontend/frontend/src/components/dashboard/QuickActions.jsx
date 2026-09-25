import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { IconPlus } from '../icons'

/** actions: [{ label, to, icon?, onClick? }] — labels are supplied by each
 * calling page (already its own translated string), so only the default
 * title here needs a fallback translation. */
export default function QuickActions({ title, actions = [] }) {
  const { t } = useLanguage()
  if (actions.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <h3 className="text-sm font-bold text-navy-900 dark:text-white">{title || t('dashboardChrome.quickActions.defaultTitle')}</h3>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon ?? IconPlus
          const content = (
            <>
              <Icon className="h-4 w-4 text-brand-500" />
              <span className="truncate">{action.label}</span>
            </>
          )
          const className =
            'flex items-center gap-2 rounded-xl bg-navy-50 px-3.5 py-2.5 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-100 dark:bg-white/5 dark:text-navy-100 dark:hover:bg-white/10'

          return action.to ? (
            <Link key={action.label} to={action.to} className={className}>
              {content}
            </Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick} className={className}>
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
