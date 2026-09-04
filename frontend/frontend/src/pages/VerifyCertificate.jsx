import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { IconAward, IconCheck, IconSearch } from '../components/icons'

export default function VerifyCertificate() {
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await apiFetch('/certificates/verify/', {
        method: 'POST',
        body: { verification_code: code },
      })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <IconAward className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-navy-900">Verify a Certificate</h1>
        <p className="mt-2 text-sm text-navy-700/60">
          Enter the verification code printed on an Asa Academy certificate to confirm it's genuine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 8F3C2A1B9D0E"
          className="flex-1 rounded-full border border-navy-900/10 px-5 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          <IconSearch className="h-4 w-4" />
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 text-center text-sm font-medium text-red-600">{error}</div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
          {result.valid ? (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <IconCheck className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-700">Certificate verified</p>
                <p className="mt-2 text-sm text-navy-800">
                  Issued to <span className="font-semibold">{result.certificate.student.full_name}</span> for{' '}
                  <span className="font-semibold">{result.certificate.course_detail.title}</span>
                </p>
                <p className="mt-1 text-xs text-navy-700/50">
                  Certificate #{result.certificate.certificate_number} &middot; Issued{' '}
                  {new Date(result.certificate.issue_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-navy-700/60">{result.detail}</p>
          )}
        </div>
      )}
    </div>
  )
}
