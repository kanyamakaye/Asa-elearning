import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { apiFetch } from '../../lib/api'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Textarea from '../../components/ui/Textarea'
import { IconEdit, IconPlus, IconTrash } from '../../components/icons'

const EMPTY_FORM = { question: '', answer: '', category: '' }

function FAQForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.question.trim() || !form.answer.trim()) return setError('Question and answer are required.')
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <FormField label="Question" required>
        <Input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} autoFocus />
      </FormField>
      <FormField label="Answer" required>
        <Textarea rows={4} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
      </FormField>
      <FormField label="Category" hint="Optional, groups related FAQs.">
        <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save FAQ'}</Button>
      </div>
    </div>
  )
}

export default function FAQsList() {
  const { accessToken, user } = useAuth()
  const confirm = useConfirm()
  const canManage = user?.user_type === 'admin'
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', faq? }
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    apiFetch('/support/faqs/', { token: accessToken })
      .then((data) => setFaqs(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  async function save(form) {
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await apiFetch('/support/faqs/', { method: 'POST', body: form, token: accessToken })
      } else {
        await apiFetch(`/support/faqs/${modal.faq.id}/`, { method: 'PATCH', body: form, token: accessToken })
      }
      setModal(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(faq) {
    if (!(await confirm(`Delete FAQ "${faq.question}"?`))) return
    await apiFetch(`/support/faqs/${faq.id}/`, { method: 'DELETE', token: accessToken })
    load()
  }

  async function toggleActive(faq) {
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f)))
    await apiFetch(`/support/faqs/${faq.id}/`, {
      method: 'PATCH', body: { is_active: !faq.is_active }, token: accessToken,
    }).catch(load)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description={`${faqs.length} question${faqs.length === 1 ? '' : 's'}`}
        actions={canManage ? <Button onClick={() => setModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Add FAQ</Button> : null}
      />

      {loading ? (
        <LoadingSpinner label="Loading FAQs…" />
      ) : (
        <div className="divide-y divide-navy-900/6 rounded-2xl bg-white ring-1 ring-navy-900/8">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900">{faq.question}</p>
                <p className="mt-1 text-sm text-navy-700/60">{faq.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(faq)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    faq.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-100 text-navy-700'
                  }`}
                >
                  {faq.is_active ? 'Active' : 'Inactive'}
                </button>
                {canManage && (
                  <>
                    <button type="button" onClick={() => setModal({ mode: 'edit', faq })} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit FAQ">
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(faq)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete FAQ">
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add FAQ' : 'Edit FAQ'}>
        {modal && (
          <FAQForm
            initial={modal.mode === 'edit' ? { question: modal.faq.question, answer: modal.faq.answer, category: modal.faq.category ?? '' } : EMPTY_FORM}
            onSave={save}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  )
}
