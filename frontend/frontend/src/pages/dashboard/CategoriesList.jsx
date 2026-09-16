import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { apiFetch } from '../../lib/api'
import { exportTableToExcel, exportTableToPdf } from '../../lib/exportTable'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Textarea from '../../components/ui/Textarea'
import { IconArrowDown, IconEdit, IconPlus, IconSearch, IconTrash } from '../../components/icons'

const EXPORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'course_count', label: 'Courses' },
]

const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']
const EMPTY_FORM = { name: '', description: '' }

function CategoryForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.name.trim()) return setError('Name is required.')
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
      <FormField label="Name" required>
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
      </FormField>
      <FormField label="Description">
        <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save Category'}</Button>
      </div>
    </div>
  )
}

export default function CategoriesList() {
  const { accessToken, user } = useAuth()
  const confirm = useConfirm()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', category? }
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    apiFetch('/courses/categories/', { token: accessToken })
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  async function save(form) {
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await apiFetch('/courses/categories/', { method: 'POST', body: form, token: accessToken })
      } else {
        await apiFetch(`/courses/categories/${modal.category.slug}/`, { method: 'PATCH', body: form, token: accessToken })
      }
      setModal(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(cat) {
    const { confirmed, reason } = await confirm(`Delete category "${cat.name}"? Courses in this category will be uncategorized.`)
    if (!confirmed) return
    await apiFetch(`/courses/categories/${cat.slug}/`, { method: 'DELETE', token: accessToken, body: reason ? { reason } : undefined })
    load()
  }

  const filteredCategories = categories.filter((c) => {
    const q = search.trim().toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Categories"
        description={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
        actions={canManage ? <Button onClick={() => setModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Add Category</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-700/35" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full rounded-lg border border-navy-900/10 py-2 pl-8 pr-3 text-xs text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Button
          type="button" size="sm" variant="outline"
          onClick={() => exportTableToExcel(filteredCategories, EXPORT_COLUMNS, 'categories')}
        >
          <IconArrowDown className="h-3.5 w-3.5" /> Excel
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          onClick={() => exportTableToPdf(filteredCategories, EXPORT_COLUMNS, 'categories', 'Course Categories')}
        >
          <IconArrowDown className="h-3.5 w-3.5" /> PDF
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading categories…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-navy-900">{cat.name}</h3>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => setModal({ mode: 'edit', category: cat })} className="rounded-lg p-1 text-navy-700/50 hover:bg-navy-50" aria-label="Edit category">
                      <IconEdit className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(cat)} className="rounded-lg p-1 text-red-500 hover:bg-red-50" aria-label="Delete category">
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-navy-700/55">{cat.description || 'No description.'}</p>
              <p className="mt-3 text-xs font-semibold text-brand-500">{cat.course_count} courses</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add Category' : 'Edit Category'}>
        {modal && (
          <CategoryForm
            initial={modal.mode === 'edit' ? { name: modal.category.name, description: modal.category.description } : EMPTY_FORM}
            onSave={save}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  )
}
