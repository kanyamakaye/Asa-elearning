export default function PortfolioSummary({ data }) {
  if (!data) return null

  const items = [
    { label: 'Active Courses', value: data.active_courses, color: 'text-navy-900' },
    { label: 'Total Courses', value: data.total_courses, color: 'text-violet-600' },
    { label: 'Completed Enrollments', value: data.completed_enrollments, color: 'text-emerald-600' },
    { label: 'New Enrollments', value: data.new_enrollments_period, color: 'text-brand-500' },
    { label: 'Pending Review', value: data.pending_review, color: 'text-amber-600' },
    { label: 'Inactive Courses', value: data.inactive_courses, color: 'text-red-500' },
    { label: 'Active Categories', value: data.active_categories, color: 'text-violet-500' },
  ]

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <h3 className="text-sm font-bold text-navy-900">Portfolio Summary — {data.period_label}</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className={`font-display text-2xl font-extrabold ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-xs font-medium leading-tight text-navy-700/50">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
