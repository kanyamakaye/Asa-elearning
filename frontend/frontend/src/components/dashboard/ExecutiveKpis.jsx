import { formatCurrency } from '../../lib/currency'

const KPI_META = [
  { key: 'total_revenue', label: 'Total Revenue', accent: 'border-t-brand-500', money: true },
  { key: 'new_enrollments', label: 'New Enrollments', accent: 'border-t-violet-500', money: false },
  { key: 'pending_payments', label: 'Pending Payments', accent: 'border-t-amber-500', money: true },
  { key: 'active_students', label: 'Active Students', accent: 'border-t-navy-700', money: false },
]

function formatValue(value, money) {
  return money ? formatCurrency(value) : (Number(value) || 0).toLocaleString()
}

export default function ExecutiveKpis({ data }) {
  if (!data) return null

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-navy-900">Executive KPIs</h3>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_META.map(({ key, label, accent, money }) => {
          const kpi = data[key]
          if (!kpi) return null
          const positive = kpi.change_percent >= 0
          return (
            <div key={key} className={`rounded-2xl border-t-4 bg-white p-5 ring-1 ring-navy-900/8 ${accent}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-700/50">{label}</p>
                <span
                  className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {positive ? '↑' : '↓'} {Math.abs(kpi.change_percent)}%
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-navy-900">{formatValue(kpi.value, money)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
