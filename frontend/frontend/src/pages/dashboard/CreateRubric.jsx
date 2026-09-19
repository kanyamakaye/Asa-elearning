import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRubric } from '../../services/rubricService'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import Textarea from '../../components/ui/Textarea'
import { IconPlus, IconTrash } from '../../components/icons'

function emptyCriterion() {
  return { title: '', max_points: 10 }
}

const INITIAL_FORM = { title: '', description: '', criteria: [emptyCriterion(), emptyCriterion()] }

export default function CreateRubric() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM), [form])
  useUnsavedChanges(dirty && !success)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
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

  function validate() {
    const next = {}
    if (form.title.trim().length < 3) next.title = 'Must be at least 3 characters long.'
    if (form.criteria.length === 0) next.criteria = 'Add at least one criterion.'
    else if (form.criteria.some((c) => !c.title.trim())) next.criteria = 'Every criterion needs a title.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      await createRubric({
        title: form.title,
        description: form.description,
        criteria: form.criteria.map((c, i) => ({ title: c.title, max_points: Number(c.max_points) || 0, order: i })),
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/rubrics'), 1200)
    } catch (err) {
      setSubmitError(err.message || 'Could not create this rubric.')
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Rubric created successfully.">Redirecting…</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Rubrics', to: '/dashboard/rubrics' },
              { label: 'New Rubric' },
            ]}
          />
        }
        title="New Rubric"
        description="Create a reusable scoring guide you can attach to any assignment."
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title="Rubric Details">
        <div className="space-y-5">
          <FormField label="Title" required error={errors.title}>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Essay Rubric" error={errors.title} />
          </FormField>
          <FormField label="Description" hint="Optional">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title={`Criteria — ${totalPoints} points total`}>
        <div className="space-y-2">
          {errors.criteria && <p className="text-sm font-medium text-red-600">{errors.criteria}</p>}
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
              <button type="button" onClick={() => removeCriterion(i)} className="text-navy-700/40 hover:text-red-600" aria-label="Remove criterion">
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={addCriterion}>
          <IconPlus className="h-3.5 w-3.5" /> Add Criterion
        </Button>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/rubrics')}>Cancel</Button>
        <Button type="button" loading={loading} disabled={loading} onClick={handleSubmit}>
          {loading ? 'Creating Rubric…' : 'Create Rubric'}
        </Button>
      </div>
    </div>
  )
}
