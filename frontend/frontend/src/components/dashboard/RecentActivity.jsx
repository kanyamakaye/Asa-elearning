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

function timeAgo(isoString) {
  if (!isoString) return ''
  const diffMs = Date.now() - new Date(isoString).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(isoString).toLocaleDateString()
}

export default function RecentActivity({ items = [], emptyMessage = 'Nothing to show yet.' }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <h3 className="text-sm font-bold text-navy-900">Recent Activity</h3>

      {items.length === 0 ? (
        <p className="mt-6 pb-2 text-center text-sm text-navy-700/45">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 divide-y divide-navy-900/6">
          {items.map((item, i) => {
            const Icon = ICONS_BY_TYPE[item.type] ?? IconStar
            return (
              <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700/60">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-navy-700/45">{timeAgo(item.timestamp)}</p>
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
