import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listMessages, listUsers, markMessageRead, sendMessage } from '../../lib/dashboardApi'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { IconChat, IconPlus } from '../../components/icons'

export default function MessagesInbox() {
  const { accessToken, user } = useAuth()
  const [box, setBox] = useState('inbox')
  const [messages, setMessages] = useState([])
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ receiver: '', subject: '', message_body: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await listMessages(accessToken, { box })
      setMessages(data.results ?? data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accessToken, box]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listUsers(accessToken).then((data) => setRecipients((data.results ?? data).filter((u) => u.id !== user?.id))).catch(() => {})
  }, [accessToken, user?.id])

  async function openMessage(m) {
    if (box === 'inbox' && !m.is_read) {
      await markMessageRead(m.id, accessToken)
      await load()
    }
  }

  async function submit() {
    if (!form.receiver || !form.message_body.trim()) {
      setError('Recipient and message are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await sendMessage(form, accessToken)
      setModalOpen(false)
      setForm({ receiver: '', subject: '', message_body: '' })
      setBox('sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Messages"
        description={`${messages.length} message${messages.length === 1 ? '' : 's'}`}
        actions={<Button onClick={() => setModalOpen(true)}><IconPlus className="h-4 w-4" /> Compose</Button>}
      />

      <div className="flex gap-2">
        {['inbox', 'sent'].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBox(b)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              box === b ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-700/60 hover:bg-navy-100'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8">
          <IconChat className="mx-auto h-8 w-8 text-navy-700/25" />
          <p className="mt-3 text-sm text-navy-700/50">No messages here yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-navy-900/6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8">
          {messages.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => openMessage(m)} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-navy-50/40">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-navy-900">
                      {box === 'inbox' ? m.sender?.full_name ?? m.sender?.username : m.receiver_detail?.full_name ?? m.receiver_detail?.username}
                    </p>
                    {box === 'inbox' && !m.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  {m.subject && <p className="mt-0.5 text-sm font-semibold text-navy-800">{m.subject}</p>}
                  <p className="mt-0.5 truncate text-sm text-navy-700/60">{m.message_body}</p>
                </div>
                <span className="shrink-0 text-xs text-navy-700/40">{new Date(m.sent_at).toLocaleDateString()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Message">
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <FormField label="To" required>
            <Select value={form.receiver} onChange={(e) => setForm((f) => ({ ...f, receiver: e.target.value }))}>
              <option value="">Select a recipient</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name ?? r.username} ({r.user_type})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Subject">
            <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </FormField>
          <FormField label="Message" required>
            <Textarea rows={5} value={form.message_body} onChange={(e) => setForm((f) => ({ ...f, message_body: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Sending…' : 'Send Message'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
