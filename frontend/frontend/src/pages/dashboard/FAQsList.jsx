import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { IconPlus } from '../../components/icons'

export default function FAQsList() {
  const { accessToken } = useAuth()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    apiFetch('/support/faqs/', { token: accessToken })
      .then((data) => setFaqs(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await apiFetch('/support/faqs/', { method: 'POST', body: { question, answer }, token: accessToken })
      setQuestion('')
      setAnswer('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(faq) {
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f)))
    await apiFetch(`/support/faqs/${faq.id}/`, {
      method: 'PATCH', body: { is_active: !faq.is_active }, token: accessToken,
    }).catch(load)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">FAQs</h1>
        <p className="mt-1 text-sm text-navy-700/55">{faqs.length} question{faqs.length === 1 ? '' : 's'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
        <label className="block">
          <span className="text-xs font-semibold text-navy-900">Question</span>
          <input
            type="text" required value={question} onChange={(e) => setQuestion(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-navy-900">Answer</span>
          <textarea
            required rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <button
          type="submit" disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          <IconPlus className="h-4 w-4" />
          Add FAQ
        </button>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </form>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
      ) : (
        <div className="divide-y divide-navy-900/6 rounded-2xl bg-white ring-1 ring-navy-900/8">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900">{faq.question}</p>
                <p className="mt-1 text-sm text-navy-700/60">{faq.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(faq)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  faq.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-100 text-navy-700'
                }`}
              >
                {faq.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
