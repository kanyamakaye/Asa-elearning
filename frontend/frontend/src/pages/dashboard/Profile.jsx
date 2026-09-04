import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { ROLE_LABELS } from '../../components/dashboard/navConfig'

export default function Profile() {
  const { accessToken, user, setUser } = useAuth()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/users/me/', { token: accessToken })
      .then((data) =>
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          phone_number: data.phone_number ?? '',
          country: data.country ?? '',
          city: data.city ?? '',
          address: data.address ?? '',
        })
      )
      .catch(() => {})
  }, [accessToken])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const updated = await apiFetch('/users/me/', { method: 'PATCH', body: form, token: accessToken })
      setUser?.(updated)
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">My Profile</h1>
        <p className="mt-1 text-sm text-navy-700/55">
          {user?.email} &middot; {ROLE_LABELS[user?.user_type] ?? user?.user_type}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        {message && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">First name</span>
            <input
              type="text" value={form.first_name} onChange={update('first_name')}
              className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">Last name</span>
            <input
              type="text" value={form.last_name} onChange={update('last_name')}
              className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-navy-900">Phone number</span>
          <input
            type="text" value={form.phone_number} onChange={update('phone_number')}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">City</span>
            <input
              type="text" value={form.city} onChange={update('city')}
              className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">Country</span>
            <input
              type="text" value={form.country} onChange={update('country')}
              className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-navy-900">Address</span>
          <input
            type="text" value={form.address} onChange={update('address')}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <button
          type="submit" disabled={saving}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
