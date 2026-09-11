import { IconClock, IconDatabase, IconShield, IconTrendingUp } from '../icons'

function humanizeUptime(seconds) {
  if (!seconds || seconds < 60) return '<1m'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const ACCENTS = {
  brand: 'bg-brand-50 text-brand-500',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
}

export default function SystemOverview({ system }) {
  if (!system) return null

  const tiles = [
    { icon: IconClock, label: 'Server Uptime', value: humanizeUptime(system.uptime_seconds), accent: 'emerald' },
    { icon: IconDatabase, label: 'Storage Usage', value: `${system.storage_usage_percent}%`, accent: 'brand' },
    { icon: IconShield, label: 'Active Sessions', value: system.active_sessions ?? 0, accent: 'violet' },
    { icon: IconTrendingUp, label: 'API Response', value: `${system.api_response_ms}ms`, accent: 'amber' },
  ]

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900">System Overview</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          All Systems Operational
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl bg-navy-50/60 p-3 text-center">
            <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${ACCENTS[t.accent]}`}>
              <t.icon className="h-4 w-4" />
            </span>
            <p className="mt-2 font-display text-base font-extrabold text-navy-900">{t.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-navy-700/50">{t.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
