import { IconRefresh } from '../icons'

/** Prominent banner header for dashboard landing pages — icon + title/subtitle
 * on a dark gradient, with an optional refresh action on the right. */
export default function DashboardHero({ icon: Icon, title, subtitle, onRefresh, refreshing }) {
  return (
    <div className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-violet-600 bg-[length:200%_200%] px-5 py-5 text-white shadow-lg shadow-navy-900/15 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 20%, rgba(139,92,246,0.35), transparent 45%), radial-gradient(circle at 10% 100%, rgba(111,143,255,0.25), transparent 40%)',
        }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-navy-100/70">{subtitle}</p>}
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
