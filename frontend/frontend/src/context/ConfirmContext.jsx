import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Textarea from '../components/ui/Textarea'
import { IconTrash } from '../components/icons'

const ConfirmContext = createContext(null)

/** Replaces window.confirm() with a branded modal (see components/ui/Modal)
 * across the dashboard — mainly for delete confirmations, so it defaults to
 * a "danger" look and collects an optional reason, but any confirmation can
 * opt into a neutral one without the reason field. Mounted once at the app
 * root; call sites `await confirm('Delete this?')` and get back
 * `{ confirmed, reason }` instead of window.confirm's plain boolean. */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const [reason, setReason] = useState('')
  const resolver = useRef(null)

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : options
    return new Promise((resolve) => {
      resolver.current = resolve
      setReason('')
      setRequest({
        tone: 'danger',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        askReason: true,
        reasonRequired: false,
        ...opts,
      })
    })
  }, [])

  function settle(confirmed) {
    const result = { confirmed, reason: confirmed ? reason.trim() : '' }
    setRequest(null)
    resolver.current?.(result)
    resolver.current = null
  }

  const showReason = request?.tone === 'danger' && request?.askReason
  const confirmDisabled = showReason && request?.reasonRequired && !reason.trim()

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
              disabled={confirmDisabled}
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
          <div className="min-w-0 flex-1 pt-1.5">
            {request?.title && <h4 className="text-sm font-bold text-navy-900">{request.title}</h4>}
            <p className="mt-1 text-sm leading-relaxed text-navy-700/70">{request?.message}</p>

            {showReason && (
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-semibold text-navy-700/60">
                  Reason {request?.reasonRequired ? '' : '(optional)'}
                </label>
                <Textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you deleting this?"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

/** Returns `confirm(messageOrOptions) => Promise<{ confirmed, reason }>`.
 * Pass a string for a quick delete confirmation, or `{ title, message,
 * confirmLabel, cancelLabel, tone: 'danger' | 'default', askReason,
 * reasonRequired }` for more control. `askReason` defaults to true for the
 * default 'danger' tone and is ignored for 'default' tone. */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}
