import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { createAssignment, getAssignment, publishAssignment, updateAssignment } from '../../../services/assignmentService'
import { getModulesForCourse } from '../../../services/moduleService'
import { getRubrics } from '../../../services/rubricService'
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
  rubric: '',
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
    rubric: a.rubric ?? '',
  }
}

export default function CreateAssignment() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { courses } = useCourseOptions()
  const [form, setForm] = useState(INITIAL_FORM)
  const [modules, setModules] = useState([])
  const [rubrics, setRubrics] = useState([])
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

  useEffect(() => {
    getRubrics({ page_size: 100 }).then((data) => setRubrics(data.results ?? data)).catch(() => {})
  }, [])

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
    if (form.title.trim().length < 3) next.title = t('dashboardInstructor.createAssignment.errors.titleMinLength')
    if (!form.course) next.course = t('dashboardInstructor.createAssignment.errors.required')
    if (!form.description.trim()) next.description = t('dashboardInstructor.createAssignment.errors.required')
    if (!form.instructions.trim()) next.instructions = t('dashboardInstructor.createAssignment.errors.required')
    if (!form.maximum_marks || Number(form.maximum_marks) <= 0) next.maximum_marks = t('dashboardInstructor.createAssignment.errors.greaterThanZero')
    if (Number(form.passing_marks) > Number(form.maximum_marks)) next.passing_marks = t('dashboardInstructor.createAssignment.errors.cannotExceedMax')
    if (!form.due_date) next.due_date = t('dashboardInstructor.createAssignment.errors.required')
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
        rubric: form.rubric || null,
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

  if (initialLoading) return <LoadingSpinner label={t('dashboardInstructor.createAssignment.loadingAssignment')} />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={isEdit ? t('dashboardInstructor.createAssignment.updatedSuccess') : t('dashboardInstructor.createAssignment.createdSuccess')}>
          {t('dashboardInstructor.createAssignment.redirecting')}
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: t('dashboardInstructor.createAssignment.breadcrumbDashboard'), to: '/dashboard' }, { label: t('dashboardInstructor.createAssignment.breadcrumbAssignments'), to: '/dashboard/assignments' }, { label: isEdit ? t('dashboardInstructor.createAssignment.editTitle') : t('dashboardInstructor.createAssignment.createTitle') }]} />}
        title={isEdit ? t('dashboardInstructor.createAssignment.editTitle') : t('dashboardInstructor.createAssignment.createTitle')}
        description={t('dashboardInstructor.createAssignment.pageDescription')}
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title={t('dashboardInstructor.createAssignment.basicInformation')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.createAssignment.assignmentTitle')} required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.course')} required error={errors.course}>
            <Select value={form.course} onChange={(e) => updateCourse(e.target.value)} error={errors.course}>
              <option value="">{t('dashboardInstructor.createAssignment.selectCourse')}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.module')} hint={t('dashboardInstructor.createAssignment.moduleHint')}>
            <Select value={form.module} onChange={(e) => update('module', e.target.value)} disabled={!form.course}>
              <option value="">{t('dashboardInstructor.createAssignment.wholeCourse')}</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.description')} required error={errors.description} className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} error={errors.description} />
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.instructions')} required error={errors.instructions} className="sm:col-span-2">
            <Textarea rows={4} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} error={errors.instructions} />
          </FormField>
        </div>
      </Card>

      <Card title={t('dashboardInstructor.createAssignment.assessment')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.createAssignment.maximumMarks')} required error={errors.maximum_marks}>
            <Input type="number" min="1" value={form.maximum_marks} onChange={(e) => update('maximum_marks', e.target.value)} error={errors.maximum_marks} />
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.passingMarks')} required error={errors.passing_marks}>
            <Input type="number" min="0" value={form.passing_marks} onChange={(e) => update('passing_marks', e.target.value)} error={errors.passing_marks} />
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.rubric')} hint={t('dashboardInstructor.createAssignment.rubricHint')} className="sm:col-span-2">
            <Select value={form.rubric} onChange={(e) => update('rubric', e.target.value)}>
              <option value="">{t('dashboardInstructor.createAssignment.noRubric')}</option>
              {rubrics.map((r) => <option key={r.id} value={r.id}>{t('dashboardInstructor.createAssignment.rubricOptionLabel', { title: r.title, points: r.total_points })}</option>)}
            </Select>
          </FormField>
        </div>
      </Card>

      <Card title={t('dashboardInstructor.createAssignment.submission')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.createAssignment.submissionType')}>
            <Select value={form.submission_type} onChange={(e) => update('submission_type', e.target.value)}>
              <option value="file">{t('dashboardInstructor.createAssignment.fileOnly')}</option>
              <option value="text">{t('dashboardInstructor.createAssignment.textOnly')}</option>
              <option value="file_and_text">{t('dashboardInstructor.createAssignment.fileAndText')}</option>
            </Select>
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.maxFileSize')} hint={t('dashboardInstructor.createAssignment.optional')}>
            <Input type="number" min="0" value={form.max_file_size} onChange={(e) => update('max_file_size', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title={t('dashboardInstructor.createAssignment.deadline')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.createAssignment.dueDate')} required error={errors.due_date}>
            <Input type="datetime-local" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} error={errors.due_date} />
          </FormField>
          <FormField label={t('dashboardInstructor.createAssignment.latePenalty')} hint={t('dashboardInstructor.createAssignment.optional')}>
            <Input type="number" min="0" max="100" value={form.late_penalty} onChange={(e) => update('late_penalty', e.target.value)} disabled={!form.allow_late_submission} />
          </FormField>
        </div>
        <div className="mt-4">
          <Checkbox label={t('dashboardInstructor.createAssignment.allowLateSubmission')} checked={form.allow_late_submission} onChange={(e) => update('allow_late_submission', e.target.checked)} />
        </div>
      </Card>

      <Card title={t('dashboardInstructor.createAssignment.attachment')}>
        <FileUpload label={t('dashboardInstructor.createAssignment.uploadReferenceFile')} value={form.attachment} onChange={(file) => update('attachment', file)} maxSizeMb={20} />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/assignments')}>{t('dashboardInstructor.createAssignment.cancel')}</Button>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" loading={loading} disabled={loading} onClick={() => handleSubmit(false)}>
            {loading ? (isEdit ? t('dashboardInstructor.createAssignment.saving') : t('dashboardInstructor.createAssignment.creating')) : t('dashboardInstructor.createAssignment.saveDraft')}
          </Button>
          <Button type="button" loading={loading} disabled={loading} onClick={() => handleSubmit(true)}>
            {loading ? (isEdit ? t('dashboardInstructor.createAssignment.saving') : t('dashboardInstructor.createAssignment.creating')) : isEdit ? t('dashboardInstructor.createAssignment.saveAndPublish') : t('dashboardInstructor.createAssignment.createTitle')}
          </Button>
        </div>
      </div>
    </div>
  )
}
