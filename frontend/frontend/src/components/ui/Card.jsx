export default function Card({ title, description, actions, className = '', children }) {
  return (
    <div className={`rounded-2xl bg-white p-6 ring-1 ring-navy-900/8 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-bold text-navy-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-navy-700/55">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
