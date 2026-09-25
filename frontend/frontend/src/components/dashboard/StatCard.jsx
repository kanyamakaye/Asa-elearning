export default function StatCard({ icon: Icon, label, value, hint, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    navy: 'bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-navy-100',
  }

  return (
    <div className="group rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/5 hover:ring-navy-900/12 dark:bg-navy-800 dark:ring-white/10 dark:hover:ring-white/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-700/50 dark:text-navy-100/50">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${accents[accent] ?? accents.brand}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-navy-900 dark:text-white">{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-navy-700/50 dark:text-navy-100/50">{hint}</p>}
    </div>
  )
}
