import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { searchMessageContacts, startConversation } from '../../lib/dashboardApi'
import Modal from '../ui/Modal'
import { IconCheck, IconSearch } from '../icons'

const ROLE_LABELS = {
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
  academic_manager: 'Admin',
  content_manager: 'Admin',
  support_staff: 'Support',
}

function Avatar({ user, size = 'h-9 w-9' }) {
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xs font-bold text-navy-700`}>
      {user.profile_picture ? (
        <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
      ) : (
        (user.full_name || user.username || '?')[0]?.toUpperCase()
      )}
    </div>
  )
}

// "New Message" composer (Messages spec §10) — only offers recipients the
// current user is actually authorized to contact (GET /messages/contacts/,
// role-scoped server-side via messaging.authorization).
export default function NewConversationModal({ open, onClose, onCreated }) {
  const { accessToken } = useAuth()
  const [query, setQuery] = useState('')
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [recipient, setRecipient] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setQuery('')
    setContacts([])
    setRecipient(null)
    setMessage('')
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const timer = setTimeout(() => {
      setLoadingContacts(true)
      searchMessageContacts(accessToken, query)
        .then((data) => setContacts(data))
        .catch(() => setContacts([]))
        .finally(() => setLoadingContacts(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [open, query, accessToken])

  async function handleSend() {
    if (!recipient || !message.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const conversation = await startConversation({ recipient: recipient.id, message: message.trim() }, accessToken)
      onCreated(conversation)
    } catch (err) {
      setError(err.message || 'Unable to send this message right now.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Message" size="md">
      <div className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        <div>
          <label className="text-sm font-semibold text-navy-900">To</label>
          {recipient ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-navy-50/60 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar user={recipient} size="h-8 w-8" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-900">{recipient.full_name}</p>
                  <p className="text-xs text-navy-700/50">{ROLE_LABELS[recipient.user_type] ?? recipient.user_type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecipient(null)}
                className="shrink-0 text-xs font-semibold text-brand-500 hover:text-navy-900"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative mt-2">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700/35" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search students, instructors, admins…"
                  className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl ring-1 ring-navy-900/8">
                {loadingContacts ? (
                  <p className="px-4 py-6 text-center text-sm text-navy-700/45">Searching…</p>
                ) : contacts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-navy-700/45">
                    {query ? 'No matching contacts found.' : 'Start typing to search your available contacts.'}
                  </p>
                ) : (
                  contacts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRecipient(c)}
                      className="flex w-full items-center gap-2.5 border-b border-navy-900/6 px-3.5 py-2.5 text-left last:border-0 hover:bg-navy-50/60"
                    >
                      <Avatar user={c} size="h-8 w-8" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">{c.full_name}</p>
                        <p className="text-xs text-navy-700/50">{ROLE_LABELS[c.user_type] ?? c.user_type}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-navy-900">Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message…"
            className="mt-2 w-full resize-none rounded-xl border border-navy-900/10 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-navy-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!recipient || !message.trim() || sending}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {sending ? 'Sending…' : (
              <>
                <IconCheck className="h-4 w-4" /> Send
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export { Avatar, ROLE_LABELS }
