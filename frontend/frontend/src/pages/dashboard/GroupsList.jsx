import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGroup, deleteGroup, getGroups } from '../../services/groupService'
import useCourseOptions from '../../hooks/useCourseOptions'
import DataTable from '../../components/dashboard/DataTable'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { IconEdit, IconPlus, IconTrash, IconUsers } from '../../components/icons'

const EMPTY_FORM = { name: '', description: '', course: '' }

export default function GroupsList() {
  const { courses } = useCourseOptions()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    getGroups({ page_size: 100 })
      .then((data) => setGroups(data.results ?? data))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  async function handleCreate() {
    if (form.name.trim().length < 3) {
      setError('Name must be at least 3 characters long.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createGroup({ name: form.name, description: form.description, course: form.course || null })
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.message || 'Could not create this group.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(group) {
    if (!window.confirm(`Delete group "${group.name}"? This cannot be undone.`)) return
    setBusyId(group.id)
    try {
      await deleteGroup(group.id)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Groups"
        description="Organize students into classes or cohorts for reporting and communication."
        actions={<Button onClick={openCreate}><IconPlus className="h-4 w-4" /> New Group</Button>}
      />

      <DataTable
        loading={loading}
        rows={groups}
        emptyMessage="No groups yet. Create your first one."
        columns={[
          { key: 'name', label: 'Name', render: (g) => <span className="font-semibold text-navy-900">{g.name}</span> },
          { key: 'course_title', label: 'Course', render: (g) => g.course_title ?? '—' },
          { key: 'instructor_detail', label: 'Instructor', render: (g) => g.instructor_detail?.full_name ?? '—' },
          { key: 'member_count', label: 'Members', render: (g) => (
            <span className="inline-flex items-center gap-1.5"><IconUsers className="h-3.5 w-3.5 text-navy-700/40" /> {g.member_count}</span>
          ) },
          {
            key: 'actions',
            label: '',
            render: (g) => (
              <div className="flex items-center justify-end gap-2">
                <Link to={`/dashboard/groups/${g.id}`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Manage members">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === g.id} onClick={() => handleDelete(g)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete group">
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Group"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="button" loading={saving} disabled={saving} onClick={handleCreate}>Create Group</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          <FormField label="Name" required>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning Cohort" />
          </FormField>
          <FormField label="Description" hint="Optional">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>
          <FormField label="Course" hint="Optional — scope this group to one course">
            <Select value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
              <option value="">No specific course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
