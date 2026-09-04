import { Link } from 'react-router-dom'
import { IconPlus } from '../icons'

/** actions: [{ label, to, icon?, onClick? }] */
export default function QuickActions({ title = 'Quick Actions', actions = [] }) {
  if (actions.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <h3 className="text-sm font-bold text-navy-900">{title}</h3>
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
            'flex items-center gap-2 rounded-xl bg-navy-50 px-3.5 py-2.5 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-100'

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
