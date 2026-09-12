function FilterPill({ label, children }) {
  return (
    <label className="flex items-center gap-2 rounded-xl bg-navy-50/70 px-3 py-2 text-xs font-semibold text-navy-700/55">
      <span className="whitespace-nowrap">{label}</span>
      {children}
    </label>
  )
}

const selectClass = 'bg-transparent text-sm font-semibold text-navy-900 focus:outline-none'
const dateClass = 'bg-transparent text-sm font-medium text-navy-900 focus:outline-none'

/** Slices the admin dashboard's Portfolio Summary / Executive KPIs by
 * category, level, instructor, and date range. `options` comes from the
 * dashboard payload's `filter_options`; `value`/`onChange` are the current
 * filter state, forwarded straight to getDashboard() as query params. */
export default function DashboardFilterBar({ options, value, onChange }) {
  const isFiltered = Object.values(value).some(Boolean)

  function set(key) {
    return (e) => onChange({ ...value, [key]: e.target.value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-white p-3 ring-1 ring-navy-900/8">
      <FilterPill label="Category">
        <select className={selectClass} value={value.category} onChange={set('category')}>
          <option value="">All Categories</option>
          {(options?.categories ?? []).map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </FilterPill>
      <FilterPill label="Level">
        <select className={selectClass} value={value.level} onChange={set('level')}>
          <option value="">All Levels</option>
          {(options?.levels ?? []).map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </FilterPill>
      <FilterPill label="Instructor">
        <select className={selectClass} value={value.instructor} onChange={set('instructor')}>
          <option value="">All Instructors</option>
          {(options?.instructors ?? []).map((i) => (
            <option key={i.id} value={i.id}>{`${i.first_name} ${i.last_name}`.trim()}</option>
          ))}
        </select>
      </FilterPill>
      <FilterPill label="From">
        <input type="date" className={dateClass} value={value.date_from} onChange={set('date_from')} />
      </FilterPill>
      <FilterPill label="To">
        <input type="date" className={dateClass} value={value.date_to} onChange={set('date_to')} />
      </FilterPill>
      {isFiltered && (
        <button
          type="button"
          onClick={() => onChange({ category: '', level: '', instructor: '', date_from: '', date_to: '' })}
          className="rounded-xl px-3 py-2 text-xs font-semibold text-brand-500 hover:bg-brand-50"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
