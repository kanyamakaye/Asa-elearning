import { Link } from 'react-router-dom'
import { IconArrowRight, IconBell, IconCreditCard, IconVideo } from '../icons'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const ROWS = [
  {
    key: 'upcoming_live_classes',
    icon: IconVideo,
    accent: 'text-brand-500 bg-brand-50',
    to: '/dashboard/live-classes',
    cta: 'View live classes',
    render: (item) => ({
      title: item.title,
      detail: `${item.course__title} · ${formatDate(item.scheduled_date)}${item.start_time ? ` at ${item.start_time.slice(0, 5)}` : ''}`,
    }),
  },
  {
    key: 'inactive_courses',
    icon: IconBell,
    accent: 'text-amber-600 bg-amber-50',
    to: '/dashboard/my-courses',
    cta: 'Continue learning',
    render: (item) => ({
      title: item.course_title,
      detail: `${Math.round(item.progress_percentage)}% complete · last active ${formatDate(item.last_activity)}`,
    }),
  },
  {
    key: 'unresolved_payments',
    icon: IconCreditCard,
    accent: 'text-red-600 bg-red-50',
    to: '/dashboard/payments',
    cta: 'View payments',
    render: (item) => ({
      title: item.course__title,
      detail: `${item.amount} ${item.currency} · ${item.payment_status}`,
    }),
  },
]

export default function RemindersPanel({ reminders }) {
  const sections = ROWS.map((row) => ({ ...row, items: reminders?.[row.key] ?? [] })).filter(
    (row) => row.items.length > 0
  )

  if (sections.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <div className="mb-4 flex items-center gap-2">
        <IconBell className="h-4 w-4 text-brand-500" />
        <h3 className="text-sm font-bold text-navy-900">Reminders</h3>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.key}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy-700/45">
                {section.key === 'upcoming_live_classes' && 'Upcoming Live Classes'}
                {section.key === 'inactive_courses' && 'Pick Back Up'}
                {section.key === 'unresolved_payments' && 'Needs Payment'}
              </span>
              <Link to={section.to} className="text-xs font-semibold text-brand-500 hover:text-navy-900">
                {section.cta} &rarr;
              </Link>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, i) => {
                const { title, detail } = section.render(item)
                return (
                  <li key={i} className="flex items-center gap-3 rounded-xl bg-navy-50/50 px-3 py-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${section.accent}`}>
                      <section.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900">{title}</p>
                      <p className="truncate text-xs text-navy-700/55">{detail}</p>
                    </div>
                    <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-navy-700/30" />
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
