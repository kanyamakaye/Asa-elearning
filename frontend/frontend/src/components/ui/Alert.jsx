import { IconCheck, IconClose } from '../icons'

const tones = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  error: 'bg-red-50 text-red-600 ring-red-600/15',
  info: 'bg-brand-50 text-brand-700 ring-brand-500/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/15',
}

export default function Alert({ tone = 'info', title, children, onDismiss, className = '' }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${tones[tone]} ${className}`}>
      {tone === 'success' && <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />}
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 font-normal' : ''}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
          <IconClose className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
