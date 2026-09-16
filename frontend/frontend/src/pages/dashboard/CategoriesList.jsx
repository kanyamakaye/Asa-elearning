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
    if (!(await confirm(`Delete category "${cat.name}"? Courses in this category will be uncategorized.`))) return
    await apiFetch(`/courses/categories/${cat.slug}/`, { method: 'DELETE', token: accessToken })
    load()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Categories"
        description={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
        actions={canManage ? <Button onClick={() => setModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Add Category</Button> : null}
      />

      {loading ? (
        <LoadingSpinner label="Loading categories…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
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
