import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { createUser, deleteUser, listUsers, updateUser } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'
import { ROLE_LABELS } from '../../components/dashboard/navConfig'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import { IconEdit, IconPlus, IconTrash } from '../../components/icons'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-navy-100 text-navy-700',
  suspended: 'bg-amber-50 text-amber-700',
  blocked: 'bg-red-50 text-red-700',
}

const ROLE_OPTIONS = ['student', 'instructor', 'academic_manager', 'content_manager', 'support_staff', 'admin']
const STATUS_OPTIONS = ['active', 'inactive', 'suspended', 'blocked']

const EMPTY_FORM = { username: '', email: '', first_name: '', last_name: '', user_type: 'student', status: 'active', password: '' }

function toFormShape(user) {
  return {
    username: user.username, email: user.email, first_name: user.first_name ?? '',
    last_name: user.last_name ?? '', user_type: user.user_type, status: user.status, password: '',
  }
}

function UserForm({ initial, isEdit, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit() {
    if (!form.username.trim() || !form.email.trim()) return setError('Username and email are required.')
    if (!isEdit && !form.password.trim()) return setError('Password is required for new accounts.')
    setError('')
    try {
      const payload = { ...form }
      if (isEdit && !payload.password) delete payload.password
      await onSave(payload)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name">
          <Input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} autoFocus />
        </FormField>
        <FormField label="Last name">
          <Input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
        </FormField>
        <FormField label="Username" required>
          <Input value={form.username} onChange={(e) => update('username', e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label="Email" required>
          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </FormField>
        <FormField label="Role" required>
          <Select value={form.user_type} onChange={(e) => update('user_type', e.target.value)}>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
        </FormField>
        <FormField label="Status" required>
          <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </Select>
        </FormField>
        <FormField label={isEdit ? 'New Password' : 'Password'} required={!isEdit} hint={isEdit ? 'Leave blank to keep the current password.' : undefined} className="sm:col-span-2">
          <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" />
        </FormField>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save User'}</Button>
      </div>
    </div>
  )
}

export default function UsersList() {
  const { accessToken, user: currentUser } = useAuth()
  const confirm = useConfirm()
  const isAdmin = currentUser?.user_type === 'admin'
  const [params] = useSearchParams()
  const role = params.get('role')
  const [users, setUsers] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', user? }
  const [saving, setSaving] = useState(false)

  useEffect(() => { setPage(1) }, [role, status, search])

  function load() {
    setLoading(true)
    listUsers(accessToken, {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      page,
    })
      .then((data) => {
        setUsers(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, role, status, search, page])

  async function save(form) {
    setSaving(true)
    try {
      if (modal.mode === 'create') await createUser(form, accessToken)
      else await updateUser(modal.user.id, form, accessToken)
      setModal(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(u) {
    const { confirmed, reason } = await confirm(`Delete user "${u.full_name || u.username}"? This cannot be undone.`)
    if (!confirmed) return
    setBusyId(u.id)
    try {
      await deleteUser(u.id, accessToken, reason)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={role ? (role.includes(',') ? 'Staff' : `${ROLE_LABELS[role] ?? role}s`) : 'All Users'}
        description={`${count} user${count === 1 ? '' : 's'}`}
        actions={isAdmin ? <Button onClick={() => setModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Add User</Button> : null}
      />

      <DataTable
        loading={loading}
        rows={users}
        page={page}
        total={count}
        onPageChange={setPage}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by name, username, or email…' }}
        filters={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))],
          },
        ]}
        exportFilename="users"
        exportTitle="Users"
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          {
            key: 'user_type',
            label: 'Role',
            render: (u) => ROLE_LABELS[u.user_type] ?? u.user_type,
            exportValue: (u) => ROLE_LABELS[u.user_type] ?? u.user_type,
          },
          {
            key: 'status',
            label: 'Status',
            render: (u) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[u.status] ?? ''}`}>
                {u.status}
              </span>
            ),
          },
          {
            key: 'date_joined',
            label: 'Joined',
            render: (u) => new Date(u.date_joined).toLocaleDateString(),
          },
          ...(isAdmin ? [{
            key: 'actions',
            label: '',
            render: (u) => (
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setModal({ mode: 'edit', user: u })} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit user">
                  <IconEdit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={busyId === u.id || u.id === currentUser?.id}
                  onClick={() => remove(u)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-30"
                  aria-label="Delete user"
                  title={u.id === currentUser?.id ? "You can't delete your own account" : undefined}
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ),
          }] : []),
        ]}
      />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add User' : 'Edit User'} size="lg">
        {modal && (
          <UserForm
            initial={modal.mode === 'edit' ? toFormShape(modal.user) : EMPTY_FORM}
            isEdit={modal.mode === 'edit'}
            onSave={save}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  )
}
