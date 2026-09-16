import { useEffect, useState } from 'react'
import { useConfirm } from '../../context/ConfirmContext'
import { createRubric, deleteRubric, getRubrics } from '../../services/rubricService'
import DataTable from '../../components/dashboard/DataTable'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { IconPlus, IconTrash } from '../../components/icons'

function emptyCriterion() {
  return { title: '', max_points: 10 }
}

const EMPTY_FORM = { title: '', description: '', criteria: [emptyCriterion(), emptyCriterion()] }

export default function RubricsList() {
  const confirm = useConfirm()
  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    getRubrics({ page_size: 100 })
      .then((data) => setRubrics(data.results ?? data))
      .catch(() => setRubrics([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function updateCriterion(i, field, value) {
    setForm((f) => ({
      ...f,
      criteria: f.criteria.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }))
  }

  function addCriterion() {
    setForm((f) => ({ ...f, criteria: [...f.criteria, emptyCriterion()] }))
  }

  function removeCriterion(i) {
    setForm((f) => ({ ...f, criteria: f.criteria.filter((_, idx) => idx !== i) }))
  }

  const totalPoints = form.criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0)

  async function handleCreate() {
    if (form.title.trim().length < 3) return setError('Title must be at least 3 characters long.')
    if (form.criteria.some((c) => !c.title.trim())) return setError('Every criterion needs a title.')
    setSaving(true)
    setError('')
    try {
      await createRubric({
        title: form.title,
        description: form.description,
        criteria: form.criteria.map((c, i) => ({ title: c.title, max_points: Number(c.max_points) || 0, order: i })),
      })
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.message || 'Could not create this rubric.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(rubric) {
    if (!(await confirm(`Delete rubric "${rubric.title}"? Assignments using it will lose their rubric.`))) return
    setBusyId(rubric.id)
    try {
      await deleteRubric(rubric.id)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rubrics"
        description="Reusable scoring guides you can attach to any assignment."
        actions={<Button onClick={openCreate}><IconPlus className="h-4 w-4" /> New Rubric</Button>}
      />

      <DataTable
        loading={loading}
        rows={rubrics}
        emptyMessage="No rubrics yet. Create your first one."
        columns={[
          { key: 'title', label: 'Title', render: (r) => <span className="font-semibold text-navy-900">{r.title}</span> },
          { key: 'criteria', label: 'Criteria', render: (r) => r.criteria?.length ?? 0 },
          { key: 'total_points', label: 'Total Points' },
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <div className="flex items-center justify-end gap-2">
                <button type="button" disabled={busyId === r.id} onClick={() => handleDelete(r)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete rubric">
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
        title="New Rubric"
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="button" loading={saving} disabled={saving} onClick={handleCreate}>Create Rubric</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          <FormField label="Title" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Essay Rubric" />
          </FormField>
          <FormField label="Description" hint="Optional">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>

          <div>
            <span className="text-sm font-semibold text-navy-900">Criteria — {totalPoints} points total</span>
            <div className="mt-2 space-y-2">
              {form.criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Input
                    value={c.title}
                    onChange={(e) => updateCriterion(i, 'title', e.target.value)}
                    placeholder={`Criterion ${i + 1} (e.g. Clarity)`}
                    className="flex-1"
                  />
                  <Input
                    type="number" min="0" value={c.max_points}
                    onChange={(e) => updateCriterion(i, 'max_points', e.target.value)}
                    className="w-24"
                  />
                  <button type="button" onClick={() => removeCriterion(i)} className="text-navy-700/40 hover:text-red-600">
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" size="sm" className="mt-2.5" onClick={addCriterion}>
              <IconPlus className="h-3.5 w-3.5" /> Add Criterion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
