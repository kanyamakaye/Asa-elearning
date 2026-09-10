import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { getMyBadges } from '../../services/badgeService'
import { ROLE_LABELS } from '../../components/dashboard/navConfig'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Textarea from '../../components/ui/Textarea'

const ACCOUNT_FIELDS = ['first_name', 'last_name', 'phone_number', 'country', 'city', 'address', 'profile_picture_url']

const ROLE_PROFILE_ENDPOINT = {
  student: '/users/me/student-profile/',
  instructor: '/users/me/instructor-profile/',
}

const STUDENT_FIELDS = [
  { key: 'institution_name', label: 'Institution' },
  { key: 'department', label: 'Department' },
  { key: 'program', label: 'Program' },
  { key: 'academic_level', label: 'Academic Level' },
]

const INSTRUCTOR_FIELDS = [
  { key: 'qualification', label: 'Qualification' },
  { key: 'specialization', label: 'Specialization' },
  { key: 'department', label: 'Department' },
  { key: 'years_of_experience', label: 'Years of Experience', type: 'number' },
]

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <FormField label={label}>
      <Input type={type} value={value ?? ''} onChange={onChange} />
    </FormField>
  )
}

export default function Profile() {
  const { accessToken, user, setUser } = useAuth()
  const [account, setAccount] = useState(null)
  const [roleProfile, setRoleProfile] = useState(null)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingRole, setSavingRole] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [roleMessage, setRoleMessage] = useState('')
  const [error, setError] = useState('')
  const [badges, setBadges] = useState([])

  const roleEndpoint = ROLE_PROFILE_ENDPOINT[user?.user_type]

  useEffect(() => {
    apiFetch('/users/me/', { token: accessToken })
      .then((data) => {
        const shape = {}
        ACCOUNT_FIELDS.forEach((f) => { shape[f] = data[f] ?? '' })
        setAccount(shape)
      })
      .catch(() => {})
  }, [accessToken])

  useEffect(() => {
    if (user?.user_type !== 'student') return
    getMyBadges().then((data) => setBadges(data.results ?? data)).catch(() => {})
  }, [user?.user_type])

  useEffect(() => {
    if (!roleEndpoint) return
    apiFetch(roleEndpoint, { token: accessToken })
      .then((data) => setRoleProfile(data))
      .catch(() => {})
  }, [accessToken, roleEndpoint])

  function updateAccount(field) {
    return (e) => setAccount((f) => ({ ...f, [field]: e.target.value }))
  }

  function updateRole(field) {
    return (e) => setRoleProfile((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleAccountSubmit(e) {
    e.preventDefault()
    setError('')
    setAccountMessage('')
    setSavingAccount(true)
    try {
      const updated = await apiFetch('/users/me/', { method: 'PATCH', body: account, token: accessToken })
      setUser?.(updated)
      setAccountMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAccount(false)
    }
  }

  async function handleRoleSubmit(e) {
    e.preventDefault()
    setError('')
    setRoleMessage('')
    setSavingRole(true)
    try {
      const fieldKeys = (user.user_type === 'student' ? STUDENT_FIELDS : INSTRUCTOR_FIELDS).map((f) => f.key)
      const body = Object.fromEntries(fieldKeys.map((k) => [k, roleProfile[k] ?? '']))
      const updated = await apiFetch(roleEndpoint, { method: 'PATCH', body, token: accessToken })
      setRoleProfile(updated)
      setRoleMessage(`${user.user_type === 'student' ? 'Student' : 'Instructor'} profile updated successfully.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingRole(false)
    }
  }

  if (!account) return <LoadingSpinner label="Loading profile…" />

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">My Profile</h1>
          <Badge tone="brand">{ROLE_LABELS[user?.user_type] ?? user?.user_type}</Badge>
        </div>
        <p className="mt-1 text-sm text-navy-700/55">{user?.email}</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {user?.user_type === 'student' && badges.length > 0 && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
          <h2 className="text-sm font-bold text-navy-900">My Badges</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {badges.map((b) => (
              <div key={b.id} className="flex w-32 flex-col items-center gap-1.5 rounded-xl bg-navy-50/60 p-3 text-center" title={b.badge.description}>
                <span className="text-3xl">{b.badge.icon}</span>
                <span className="text-xs font-semibold text-navy-900">{b.badge.name}</span>
                <span className="text-[10px] text-navy-700/45">{new Date(b.awarded_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleAccountSubmit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="text-sm font-bold text-navy-900">Account Information</h2>
        {accountMessage && <Alert tone="success">{accountMessage}</Alert>}

        <div className="flex items-center gap-4">
          {account.profile_picture_url ? (
            <img
              src={account.profile_picture_url}
              alt="Profile preview"
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-navy-900/8"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
              onLoad={(e) => { e.currentTarget.style.visibility = 'visible' }}
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-white">
              {account.first_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <FormField label="Profile Picture URL" hint="Paste a link to an image — no file upload needed." className="flex-1">
            <Input
              type="url"
              value={account.profile_picture_url}
              onChange={updateAccount('profile_picture_url')}
              placeholder="https://example.com/me.jpg"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" value={account.first_name} onChange={updateAccount('first_name')} />
          <Field label="Last name" value={account.last_name} onChange={updateAccount('last_name')} />
        </div>
        <Field label="Phone number" value={account.phone_number} onChange={updateAccount('phone_number')} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" value={account.city} onChange={updateAccount('city')} />
          <Field label="Country" value={account.country} onChange={updateAccount('country')} />
        </div>
        <Field label="Address" value={account.address} onChange={updateAccount('address')} />

        <Button type="submit" loading={savingAccount} disabled={savingAccount}>
          {savingAccount ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      {roleEndpoint && (
        <form onSubmit={handleRoleSubmit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900">
              {user.user_type === 'student' ? 'Student Profile' : 'Instructor Profile'}
            </h2>
            <span className="text-xs font-mono text-navy-700/45">
              {roleProfile?.student_number ?? roleProfile?.staff_number}
            </span>
          </div>
          {roleMessage && <Alert tone="success">{roleMessage}</Alert>}

          {!roleProfile ? (
            <div className="h-24 animate-pulse rounded-xl bg-navy-50" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {(user.user_type === 'student' ? STUDENT_FIELDS : INSTRUCTOR_FIELDS).map((f) => (
                  <Field key={f.key} label={f.label} type={f.type} value={roleProfile[f.key]} onChange={updateRole(f.key)} />
                ))}
              </div>
              <FormField label="Biography">
                <Textarea rows={4} value={roleProfile.biography ?? ''} onChange={updateRole('biography')} />
              </FormField>

              <Button type="submit" loading={savingRole} disabled={savingRole}>
                {savingRole ? 'Saving…' : 'Save Changes'}
              </Button>
            </>
          )}
        </form>
      )}
    </div>
  )
}
