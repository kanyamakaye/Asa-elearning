export function IconLoader({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function LoadingSpinner({ label = 'Loading…', size = 'md', className = '' }) {
  const dims = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-navy-700/60 dark:text-navy-100/60 ${className}`}>
      <IconLoader className={`animate-spin text-brand-500 ${dims[size]}`} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
