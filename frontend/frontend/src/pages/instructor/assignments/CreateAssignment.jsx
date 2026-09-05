import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createAssignment, getAssignment, publishAssignment, updateAssignment } from '../../../services/assignmentService'
import { getModulesForCourse } from '../../../services/moduleService'
import useCourseOptions from '../../../hooks/useCourseOptions'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Checkbox from '../../../components/ui/Checkbox'
import FileUpload from '../../../components/ui/FileUpload'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'

const INITIAL_FORM = {
  course: '',
  module: '',
  title: '',
  description: '',
  instructions: '',
  maximum_marks: '100',
  passing_marks: '50',
  due_date: '',
  submission_type: 'file_and_text',
  max_file_size: '',
  allow_late_submission: false,
  late_penalty: '',
  attachment: null,
}

function toFormShape(a) {
  return {
    course: a.course,
    module: a.module ?? '',
    title: a.title,
    description: a.description,
    instructions: a.instructions ?? '',
    maximum_marks: String(a.maximum_marks),
    passing_marks: String(a.passing_marks),
    due_date: a.due_date ? a.due_date.slice(0, 16) : '',
    submission_type: a.submission_type,
    max_file_size: a.max_file_size ?? '',
    allow_late_submission: a.allow_late_submission,
    late_penalty: a.late_penalty ?? '',
    attachment: a.attachment ?? null,
  }
}

export default function CreateAssignment() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { courses } = useCourseOptions()
  const [form, setForm] = useState(INITIAL_FORM)
  const [modules, setModules] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    getAssignment(id).then((a) => !cancelled && setForm(toFormShape(a)))
      .catch((err) => !cancelled && setSubmitError(err.message))
      .finally(() => !cancelled && setInitialLoading(false))
    return () => { cancelled = true }
  }, [id, isEdit])

  useEffect(() => {
    if (!form.course) {
      setModules([])
      return
    }
    let cancelled = false
    getModulesForCourse(form.course).then((data) => !cancelled && setModules(data.results ?? data)).catch(() => {})
    return () => { cancelled = true }
  }, [form.course])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM), [form])
  useUnsavedChanges(dirty && !success)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function updateCourse(value) {
    setForm((f) => ({ ...f, course: value, module: '' }))
    setErrors((e) => ({ ...e, course: undefined }))
  }

  function validate() {
    const next = {}
    if (form.title.trim().length < 3) next.title = 'Must be at least 3 characters long.'
    if (!form.course) next.course = 'This field is required.'
    if (!form.description.trim()) next.description = 'This field is required.'
    if (!form.instructions.trim()) next.instructions = 'This field is required.'
    if (!form.maximum_marks || Number(form.maximum_marks) <= 0) next.maximum_marks = 'Must be greater than 0.'
    if (Number(form.passing_marks) > Number(form.maximum_marks)) next.passing_marks = 'Cannot exceed the maximum marks.'
    if (!form.due_date) next.due_date = 'This field is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(publish) {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const payload = {
        ...form,
        module: form.module || null,
        max_file_size: form.max_file_size || undefined,
        late_penalty: form.late_penalty || undefined,
        due_date: new Date(form.due_date).toISOString(),
      }
      const assignmentId = isEdit ? id : (await createAssignment(payload)).data.id
      if (isEdit) await updateAssignment(assignmentId, payload)
      if (publish) await publishAssignment(assignmentId)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/assignments'), 1200)
    } catch (err) {
      setSubmitError(err.message)
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <LoadingSpinner label="Loading assignment…" />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={`Assignment ${isEdit ? 'updated' : 'created'} successfully.`}>Redirecting…</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Assignments', to: '/dashboard/assignments' }, { label: isEdit ? 'Edit Assignment' : 'Create Assignment' }]} />}
        title={isEdit ? 'Edit Assignment' : 'Create Assignment'}
        description="Set up an assignment for students to submit before a deadline."
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title="Basic Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Assignment Title" required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
          </FormField>
          <FormField label="Course" required error={errors.course}>
            <Select value={form.course} onChange={(e) => updateCourse(e.target.value)} error={errors.course}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Module" hint="Optional — attach this assignment to a specific module">
            <Select value={form.module} onChange={(e) => update('module', e.target.value)} disabled={!form.course}>
              <option value="">Whole course</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Description" required error={errors.description} className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} error={errors.description} />
          </FormField>
          <FormField label="Instructions" required error={errors.instructions} className="sm:col-span-2">
            <Textarea rows={4} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} error={errors.instructions} />
          </FormField>
        </div>
      </Card>

      <Card title="Assessment">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Maximum Marks" required error={errors.maximum_marks}>
            <Input type="number" min="1" value={form.maximum_marks} onChange={(e) => update('maximum_marks', e.target.value)} error={errors.maximum_marks} />
          </FormField>
          <FormField label="Passing Marks" required error={errors.passing_marks}>
            <Input type="number" min="0" value={form.passing_marks} onChange={(e) => update('passing_marks', e.target.value)} error={errors.passing_marks} />
          </FormField>
        </div>
      </Card>

      <Card title="Submission">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Submission Type">
            <Select value={form.submission_type} onChange={(e) => update('submission_type', e.target.value)}>
              <option value="file">File only</option>
              <option value="text">Text only</option>
              <option value="file_and_text">File and text</option>
            </Select>
          </FormField>
          <FormField label="Maximum File Size (KB)" hint="Optional">
            <Input type="number" min="0" value={form.max_file_size} onChange={(e) => update('max_file_size', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title="Deadline">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Due Date" required error={errors.due_date}>
            <Input type="datetime-local" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} error={errors.due_date} />
          </FormField>
          <FormField label="Late Penalty (%)" hint="Optional">
            <Input type="number" min="0" max="100" value={form.late_penalty} onChange={(e) => update('late_penalty', e.target.value)} disabled={!form.allow_late_submission} />
          </FormField>
        </div>
        <div className="mt-4">
          <Checkbox label="Allow late submission" checked={form.allow_late_submission} onChange={(e) => update('allow_late_submission', e.target.checked)} />
        </div>
      </Card>

      <Card title="Attachment">
        <FileUpload label="Upload reference file" value={form.attachment} onChange={(file) => update('attachment', file)} maxSizeMb={20} />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/assignments')}>Cancel</Button>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" loading={loading} disabled={loading} onClick={() => handleSubmit(false)}>
            {loading ? (isEdit ? 'Saving…' : 'Creating Assignment…') : 'Save Draft'}
          </Button>
          <Button type="button" loading={loading} disabled={loading} onClick={() => handleSubmit(true)}>
            {loading ? (isEdit ? 'Saving…' : 'Creating Assignment…') : isEdit ? 'Save & Publish' : 'Create Assignment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
