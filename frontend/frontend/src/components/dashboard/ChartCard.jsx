/**
 * Dependency-free grouped bar chart. `data` is an array of rows where each
 * row has a `label` plus one numeric field per series key, e.g.
 *   data = [{ label: 'Mon', students: 3, instructors: 1 }, ...]
 *   series = [{ key: 'students', label: 'Students', color: 'bg-brand-500' }, ...]
 */
export default function ChartCard({ title, subtitle, data = [], series = [], emptyMessage = 'No data yet.' }) {
  const max = Math.max(1, ...data.flatMap((row) => series.map((s) => Number(row[s.key]) || 0)))

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-navy-900">{title}</h3>
          {subtitle && <p className="text-xs text-navy-700/50">{subtitle}</p>}
        </div>
        {series.length > 1 && (
          <div className="flex flex-wrap items-center gap-3">
            {series.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-navy-700/60">
                <span className={`h-2 w-2 rounded-full ${s.color}`} />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="mt-8 pb-4 text-center text-sm text-navy-700/45">{emptyMessage}</p>
      ) : (
        <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-1">
          {data.map((row, i) => (
            <div key={i} className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end justify-center gap-1">
                {series.map((s) => {
                  const value = Number(row[s.key]) || 0
                  const heightPct = Math.max(2, (value / max) * 100)
                  return (
                    <div
                      key={s.key}
                      title={`${s.label}: ${value}`}
                      className={`w-full max-w-[14px] rounded-t-sm ${s.color}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  )
                })}
              </div>
              <span className="text-[10px] font-medium text-navy-700/50">{row.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
