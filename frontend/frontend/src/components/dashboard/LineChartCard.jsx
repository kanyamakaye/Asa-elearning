/**
 * Dependency-free multi-series line chart. `data` is an array of rows where
 * each row has a `label` plus one numeric field per series key, e.g.
 *   data = [{ label: 'Jan', students: 320, instructors: 40 }, ...]
 *   series = [{ key: 'students', label: 'Students', color: '#2f5fff' }, ...]
 */
export default function LineChartCard({ title, subtitle, data = [], series = [], emptyMessage = 'No data yet.' }) {
  const width = 600
  const height = 220
  const padX = 6
  const padY = 14
  const max = Math.max(1, ...data.flatMap((row) => series.map((s) => Number(row[s.key]) || 0)))
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0

  function pointsFor(key) {
    return data
      .map((row, i) => {
        const x = padX + i * stepX
        const value = Number(row[key]) || 0
        const y = height - padY - (value / max) * (height - padY * 2)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  const skipEvery = data.length > 8 ? Math.ceil(data.length / 8) : 1

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
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="mt-8 pb-4 text-center text-sm text-navy-700/45">{emptyMessage}</p>
      ) : (
        <div className="mt-6">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
            {[0.25, 0.5, 0.75, 1].map((f) => {
              const y = height - padY - f * (height - padY * 2)
              return <line key={f} x1={0} x2={width} y1={y} y2={y} stroke="#0a144012" strokeWidth="1" />
            })}
            {series.map((s) => (
              <polyline
                key={s.key}
                points={pointsFor(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[10px] font-medium text-navy-700/50">
            {data.map((row, i) => (
              <span key={i} className={i % skipEvery !== 0 ? 'hidden sm:inline' : ''}>
                {row.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
