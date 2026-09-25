import { Link } from 'react-router-dom'

/** items: [{ label, to? }] — the last item renders as plain text (current page). */
export default function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null
  return (
    <nav className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-navy-700/50 dark:text-navy-100/50">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-navy-700/30 dark:text-navy-100/30">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-500 dark:hover:text-brand-300">
              {item.label}
            </Link>
          ) : (
            <span className="text-navy-700/70 dark:text-navy-100/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
