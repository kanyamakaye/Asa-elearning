import { createContext, useCallback, useContext, useState } from 'react'
import { IconCheck, IconClose, IconInfo } from '../components/icons'

const ToastContext = createContext(null)

const TONE_STYLES = {
  success: {
    icon: IconCheck,
    wrap: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20',
    iconWrap: 'bg-emerald-500 text-white',
  },
  error: {
    icon: IconClose,
    wrap: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20',
    iconWrap: 'bg-red-500 text-white',
  },
  info: {
    icon: IconInfo,
    wrap: 'bg-brand-50 text-brand-700 ring-brand-500/15 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-400/20',
    iconWrap: 'bg-brand-500 text-white',
  },
}

let idCounter = 0

/** Toast/pop-up notifications — a lighter-weight, non-blocking counterpart
 * to ConfirmContext's modal. Mounted once at the app root; call sites do
 * `const { showToast } = useToast(); showToast('Saved.', { tone: 'success' })`.
 * Auto-dismisses after `duration` ms (default 5s); pass `duration: 0` to
 * require manual dismissal. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, { tone = 'info', title, duration = 5000 } = {}) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, tone, title }])
      if (duration) {
        setTimeout(() => dismissToast(id), duration)
      }
      return id
    },
    [dismissToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const style = TONE_STYLES[toast.tone] ?? TONE_STYLES.info
          const Icon = style.icon
          return (
            <div
              key={toast.id}
              role="status"
              className={`animate-fade-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium shadow-xl shadow-navy-900/10 ring-1 ${style.wrap}`}
            >
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                {toast.title && <p className="font-bold">{toast.title}</p>}
                <p className={toast.title ? 'mt-0.5 font-normal' : ''}>{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
