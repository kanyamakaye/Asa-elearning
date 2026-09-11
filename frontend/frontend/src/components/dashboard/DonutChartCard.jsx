import { Link } from 'react-router-dom'

const PALETTE = ['#2f5fff', '#059669', '#7c3aed', '#f59e0b', '#ef4444', '#0d1b4c', '#0891b2', '#94a3b8']

/**
 * Dependency-free donut chart built from stacked SVG circle strokes.
 *   data = [{ name: 'Technology', course_count: 28 }, ...]
 */
export default function DonutChartCard({
  title,
  data = [],
  valueKey = 'course_count',
  labelKey = 'name',
  centerLabel,
  linkTo,
  emptyMessage = 'No data yet.',
}) {
  const total = data.reduce((sum, d) => sum + (Number(d[valueKey]) || 0), 0)
  const radius = 60
  const circumference = 2 * Math.PI * radius

  const segments = data.reduce((acc, d) => {
    const value = Number(d[valueKey]) || 0
    const dash = total ? (value / total) * circumference : 0
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0
    acc.push({ dash, offset })
    return acc
  }, [])

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900">{title}</h3>
        {linkTo && (
          <Link to={linkTo} className="text-xs font-semibold text-brand-500 hover:underline">
            View All
          </Link>
        )}
      </div>

      {total === 0 ? (
        <p className="mt-8 pb-4 text-center text-sm text-navy-700/45">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-4 flex justify-center">
            <div className="relative h-40 w-40 shrink-0">
              <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#0a14400d" strokeWidth="20" />
                {data.map((d, i) => (
                  <circle
                    key={i}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={PALETTE[i % PALETTE.length]}
                    strokeWidth="20"
                    strokeDasharray={`${segments[i].dash} ${circumference - segments[i].dash}`}
                    strokeDashoffset={-segments[i].offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-xl font-extrabold text-navy-900">{total}</p>
                {centerLabel && <p className="text-[10px] text-navy-700/50">{centerLabel}</p>}
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {data.map((d, i) => (
              <li key={i} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 truncate pr-2 text-navy-700/70">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  <span className="truncate">{d[labelKey]}</span>
                </span>
                <span className="shrink-0 font-semibold text-navy-800">
                  {Math.round((Number(d[valueKey]) / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
