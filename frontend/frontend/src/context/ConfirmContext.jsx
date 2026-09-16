import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { IconTrash } from '../components/icons'

const ConfirmContext = createContext(null)

/** Replaces window.confirm() with a branded modal (see components/ui/Modal)
 * across the dashboard — mainly for delete confirmations, so it defaults to
 * a "danger" look, but any confirmation can opt into a neutral one. Mounted
 * once at the app root; call sites just `await confirm('Delete this?')`
 * instead of `window.confirm('Delete this?')`. */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : options
    return new Promise((resolve) => {
      resolver.current = resolve
      setRequest({ tone: 'danger', confirmLabel: 'Delete', cancelLabel: 'Cancel', ...opts })
    })
  }, [])

  function settle(result) {
    setRequest(null)
    resolver.current?.(result)
    resolver.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(request)}
        onClose={() => settle(false)}
        size="sm"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => settle(false)}>
              {request?.cancelLabel}
            </Button>
            <Button
              type="button"
              variant={request?.tone === 'danger' ? 'danger' : 'primary'}
              onClick={() => settle(true)}
            >
              {request?.confirmLabel}
            </Button>
          </>
        }
      >
        <div className="flex gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              request?.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
            }`}
          >
            <IconTrash className="h-5 w-5" />
          </span>
          <div className="pt-1.5">
            {request?.title && <h4 className="text-sm font-bold text-navy-900">{request.title}</h4>}
            <p className="mt-1 text-sm leading-relaxed text-navy-700/70">{request?.message}</p>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

/** Returns `confirm(messageOrOptions) => Promise<boolean>`. Pass a string
 * for a quick delete confirmation, or `{ title, message, confirmLabel,
 * cancelLabel, tone: 'danger' | 'default' }` for more control. */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}
