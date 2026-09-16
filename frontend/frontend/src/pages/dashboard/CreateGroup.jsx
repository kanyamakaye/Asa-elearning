import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '../../services/groupService'
import useCourseOptions from '../../hooks/useCourseOptions'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import Textarea from '../../components/ui/Textarea'

const INITIAL_FORM = { name: '', description: '', courseIds: [] }

export default function CreateGroup() {
  const navigate = useNavigate()
  const { courses } = useCourseOptions()
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

  function toggleCourse(courseId) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(courseId)
        ? f.courseIds.filter((id) => id !== courseId)
        : [...f.courseIds, courseId],
    }))
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 3) next.name = 'Must be at least 3 characters long.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const res = await createGroup({
        name: form.name,
        description: form.description,
        course_ids: form.courseIds,
      })
      setSuccess(true)
      setTimeout(() => navigate(`/dashboard/groups/${res.data.id}`), 1200)
    } catch (err) {
      setSubmitError(err.message || 'Could not create this group.')
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Group created successfully.">Redirecting…</Alert>
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
              { label: 'Groups', to: '/dashboard/groups' },
              { label: 'New Group' },
            ]}
          />
        }
        title="New Group"
        description="Organize students into a class or cohort for reporting, communication, and course access."
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title="Group Details">
        <div className="space-y-5">
          <FormField label="Name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
              placeholder="e.g. Morning Cohort"
            />
          </FormField>
          <FormField label="Description" hint="Optional">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </FormField>
          <FormField
            label="Assigned Courses"
            hint="Optional — members of this group will be able to access these courses"
          >
            {courses.length === 0 ? (
              <p className="text-sm text-navy-700/45">No courses available.</p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl p-2 ring-1 ring-navy-900/8">
                {courses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-navy-800 hover:bg-navy-50">
                    <input
                      type="checkbox"
                      checked={form.courseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                      className="h-4 w-4 rounded border-navy-900/20 text-brand-500 focus:ring-brand-300"
                    />
                    <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  </label>
                ))}
              </div>
            )}
          </FormField>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/groups')}>Cancel</Button>
        <Button type="button" loading={loading} disabled={loading} onClick={handleSubmit}>
          {loading ? 'Creating Group…' : 'Create Group'}
        </Button>
      </div>
    </div>
  )
}
