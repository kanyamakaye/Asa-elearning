export default function FormField({ label, htmlFor, required, error, hint, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`block ${className}`}>
      {label && (
        <span className="text-sm font-semibold text-navy-900">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      )}
      <div className={label ? 'mt-2' : ''}>{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-navy-700/45">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </label>
  )
}
