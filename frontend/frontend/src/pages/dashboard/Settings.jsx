import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { apiFetch } from '../../lib/api'
import { getPlatformSettings, updatePlatformSettings } from '../../services/settingsService'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'

function PlatformSettingsCard() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState(null)
  const [currency, setCurrency] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getPlatformSettings()
      .then((data) => {
        setSettings(data)
        setCurrency(data.currency_code)
      })
      .catch(() => setError(t('dashboardStudent.settings.loadPlatformError')))
  }, [t])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await updatePlatformSettings({ currency_code: currency })
      setMessage(t('dashboardStudent.settings.currencyUpdated'))
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setError(err.message || t('dashboardStudent.settings.updatePlatformError'))
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return null

  return (
    <Card title={t('dashboardStudent.settings.platformSettings')} description={t('dashboardStudent.settings.platformSettingsDescription')}>
      <form onSubmit={handleSave} className="space-y-4">
        {message && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{message}</div>}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

        <label className="block">
          <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('dashboardStudent.settings.currency')}</span>
          <p className="mt-0.5 text-xs text-navy-700/50 dark:text-navy-100/50">
            {t('dashboardStudent.settings.currencyHint')}
          </p>
          <div className="mt-1.5 max-w-xs">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {settings.currency_choices.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </Select>
          </div>
        </label>

        <button
          type="submit" disabled={saving || currency === settings.currency_code}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          {saving ? t('dashboardStudent.settings.saving') : t('dashboardStudent.settings.saveCurrency')}
        </button>
      </form>
    </Card>
  )
}

export default function Settings() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
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
      setMessage(t('dashboardStudent.settings.passwordUpdated'))
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
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('dashboardStudent.settings.heading')}</h1>
        <p className="mt-1 text-sm text-navy-700/55 dark:text-navy-100/55">{t('dashboardStudent.settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
        <h2 className="text-sm font-bold text-navy-900 dark:text-white">{t('dashboardStudent.settings.changePassword')}</h2>
        {message && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{message}</div>}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

        <label className="block">
          <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('dashboardStudent.settings.currentPassword')}</span>
          <input
            type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('dashboardStudent.settings.newPassword')}</span>
          <input
            type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
        </label>

        <button
          type="submit" disabled={saving}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          {saving ? t('dashboardStudent.settings.updating') : t('dashboardStudent.settings.updatePassword')}
        </button>
      </form>

      {user?.user_type === 'admin' && <PlatformSettingsCard />}
    </div>
  )
}
