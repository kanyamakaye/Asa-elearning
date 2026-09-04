import { IconClose } from '../icons'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} rounded-2xl bg-white p-6 shadow-xl`}>
        <div className="flex items-start justify-between gap-4">
          {title && <h3 className="text-lg font-bold text-navy-900">{title}</h3>}
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto text-navy-700/40 hover:text-navy-900">
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
