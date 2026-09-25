export default function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 disabled:opacity-60 dark:bg-navy-800 dark:text-white ${
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-400/50 dark:focus:ring-red-500/20'
          : 'border-navy-900/10 focus:border-brand-400 focus:ring-brand-100 dark:border-white/15 dark:focus:border-brand-400 dark:focus:ring-brand-500/20'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
