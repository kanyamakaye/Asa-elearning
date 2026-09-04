const statusStyles = {
  upcoming: 'bg-brand-50 text-brand-600',
  available: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-navy-100 text-navy-700',
  overdue: 'bg-red-50 text-red-700',
  submitted: 'bg-amber-50 text-amber-700',
  graded: 'bg-emerald-50 text-emerald-700',
}

export default function AssessmentTable({ items = [], emptyMessage = 'No upcoming assessments.' }) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-navy-700/45">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-navy-900/8">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy-900/8 bg-navy-50/60">
            {['Assessment', 'Course', 'Type', 'Due Date', 'Status'].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy-700/55">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-900/6">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-navy-50/40">
              <td className="px-4 py-3 font-medium text-navy-900">{item.title}</td>
              <td className="px-4 py-3 text-navy-700/70">{item.course}</td>
              <td className="px-4 py-3 capitalize text-navy-700/70">{item.type}</td>
              <td className="px-4 py-3 text-navy-700/70">
                {item.due_date ? new Date(item.due_date).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[item.status] ?? 'bg-navy-100 text-navy-700'}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
