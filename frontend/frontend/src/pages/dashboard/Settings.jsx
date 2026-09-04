import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

export default function Settings() {
  const { accessToken } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await apiFetch('/auth/change-password/', {
        method: 'POST',
        body: { old_password: oldPassword, new_password: newPassword },
        token: accessToken,
      })
      setMessage('Password updated successfully.')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-700/55">Manage your account security.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="text-sm font-bold text-navy-900">Change Password</h2>
        {message && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

        <label className="block">
          <span className="text-sm font-semibold text-navy-900">Current password</span>
          <input
            type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-900">New password</span>
          <input
            type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <button
          type="submit" disabled={saving}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
