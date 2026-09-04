const tones = {
  neutral: 'bg-navy-100 text-navy-700',
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
