import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { createLiveClass, getLiveClass, updateLiveClass } from '../../../services/liveClassService'
import useCourseOptions from '../../../hooks/useCourseOptions'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import { useAuth } from '../../../context/AuthContext'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'

const TIMEZONES = ['UTC', 'Africa/Kigali', 'Africa/Lagos', 'Europe/London', 'America/New_York', 'Asia/Dubai']

const INITIAL_FORM = {
  course: '',
  title: '',
  description: '',
  scheduled_date: '',
  start_time: '',
  end_time: '',
  timezone: 'UTC',
  meeting_platform: 'in_app',
  meeting_url: '',
  meeting_id: '',
  meeting_password: '',
  capacity: '',
  recording_url: '',
}

function toFormShape(session) {
  return {
    course: session.course,
    title: session.title,
    description: session.description ?? '',
    scheduled_date: session.scheduled_date ?? '',
    start_time: session.start_time?.slice(0, 5) ?? '',
    end_time: session.end_time?.slice(0, 5) ?? '',
    timezone: session.timezone,
    meeting_platform: session.meeting_platform,
    meeting_url: session.meeting_url ?? '',
    meeting_id: session.meeting_id ?? '',
    meeting_password: session.meeting_password ?? '',
    capacity: session.capacity ?? '',
    recording_url: session.recording_url ?? '',
  }
}

export default function ScheduleLiveClass() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const { courses } = useCourseOptions()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    getLiveClass(id).then((session) => !cancelled && setForm(toFormShape(session)))
      .catch((err) => !cancelled && setSubmitError(err.message))
      .finally(() => !cancelled && setInitialLoading(false))
    return () => { cancelled = true }
  }, [id, isEdit])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM), [form])
  useUnsavedChanges(dirty && !success)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.course) next.course = t('dashboardInstructor.scheduleLiveClass.errors.required')
    if (!form.title.trim()) next.title = t('dashboardInstructor.scheduleLiveClass.errors.required')
    if (!form.scheduled_date) next.scheduled_date = t('dashboardInstructor.scheduleLiveClass.errors.required')
    if (!form.start_time) next.start_time = t('dashboardInstructor.scheduleLiveClass.errors.required')
    if (!form.end_time) next.end_time = t('dashboardInstructor.scheduleLiveClass.errors.required')
    if (form.start_time && form.end_time && form.end_time <= form.start_time) next.end_time = t('dashboardInstructor.scheduleLiveClass.errors.endAfterStart')
    if (form.meeting_platform !== 'in_app') {
      if (!form.meeting_url.trim()) next.meeting_url = t('dashboardInstructor.scheduleLiveClass.errors.required')
      else {
        try {
          new URL(form.meeting_url)
        } catch {
          next.meeting_url = t('dashboardInstructor.scheduleLiveClass.errors.invalidUrl')
        }
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const payload = {
        ...form,
        capacity: form.capacity || undefined,
        recording_url: form.recording_url || undefined,
      }
      if (isEdit) await updateLiveClass(id, payload)
      else await createLiveClass(payload)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/live-classes'), 1200)
    } catch (err) {
      setSubmitError(err.message)
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <LoadingSpinner label={t('dashboardInstructor.scheduleLiveClass.loadingLiveClass')} />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={isEdit ? t('dashboardInstructor.scheduleLiveClass.updatedSuccess') : t('dashboardInstructor.scheduleLiveClass.scheduledSuccess')}>
          {isEdit ? t('dashboardInstructor.scheduleLiveClass.redirecting') : t('dashboardInstructor.scheduleLiveClass.studentsNotifiedRedirecting')}
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: t('dashboardInstructor.scheduleLiveClass.breadcrumbDashboard'), to: '/dashboard' }, { label: t('dashboardInstructor.scheduleLiveClass.breadcrumbLiveClasses'), to: '/dashboard/live-classes' }, { label: isEdit ? t('dashboardInstructor.scheduleLiveClass.editTitle') : t('dashboardInstructor.scheduleLiveClass.scheduleBreadcrumb') }]} />}
        title={isEdit ? t('dashboardInstructor.scheduleLiveClass.editTitle') : t('dashboardInstructor.scheduleLiveClass.scheduleHeading')}
        description={t('dashboardInstructor.scheduleLiveClass.pageDescription')}
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title={t('dashboardInstructor.scheduleLiveClass.sessionInformation')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.scheduleLiveClass.course')} required error={errors.course}>
            <Select value={form.course} onChange={(e) => update('course', e.target.value)} error={errors.course}>
              <option value="">{t('dashboardInstructor.scheduleLiveClass.selectCourse')}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.instructor')}>
            <Input value={user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : user?.username ?? ''} disabled />
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.sessionTitle')} required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.description')} className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title={t('dashboardInstructor.scheduleLiveClass.schedule')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.scheduleLiveClass.date')} required error={errors.scheduled_date}>
            <Input type="date" value={form.scheduled_date} onChange={(e) => update('scheduled_date', e.target.value)} error={errors.scheduled_date} />
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.timezone')} required>
            <Select value={form.timezone} onChange={(e) => update('timezone', e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </Select>
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.startTime')} required error={errors.start_time}>
            <Input type="time" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} error={errors.start_time} />
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.endTime')} required error={errors.end_time}>
            <Input type="time" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} error={errors.end_time} />
          </FormField>
        </div>
      </Card>

      <Card title={t('dashboardInstructor.scheduleLiveClass.meetingInformation')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.scheduleLiveClass.platform')} required className="sm:col-span-2">
            <Select value={form.meeting_platform} onChange={(e) => update('meeting_platform', e.target.value)}>
              <option value="in_app">{t('dashboardInstructor.scheduleLiveClass.platformInApp')}</option>
              <option value="zoom">{t('dashboardInstructor.scheduleLiveClass.platformZoom')}</option>
              <option value="google_meet">{t('dashboardInstructor.scheduleLiveClass.platformGoogleMeet')}</option>
              <option value="teams">{t('dashboardInstructor.scheduleLiveClass.platformTeams')}</option>
              <option value="other">{t('dashboardInstructor.scheduleLiveClass.platformOther')}</option>
            </Select>
          </FormField>

          {form.meeting_platform === 'in_app' ? (
            <p className="sm:col-span-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-navy-700/75 dark:bg-brand-500/10 dark:text-navy-100/75">
              {t('dashboardInstructor.scheduleLiveClass.inAppNotice')}
            </p>
          ) : (
            <>
              <FormField label={t('dashboardInstructor.scheduleLiveClass.meetingUrl')} required error={errors.meeting_url}>
                <Input value={form.meeting_url} onChange={(e) => update('meeting_url', e.target.value)} placeholder="https://" error={errors.meeting_url} />
              </FormField>
              <FormField label={t('dashboardInstructor.scheduleLiveClass.meetingId')} hint={t('dashboardInstructor.scheduleLiveClass.optional')}>
                <Input value={form.meeting_id} onChange={(e) => update('meeting_id', e.target.value)} />
              </FormField>
              <FormField label={t('dashboardInstructor.scheduleLiveClass.meetingPassword')} hint={t('dashboardInstructor.scheduleLiveClass.optional')}>
                <Input value={form.meeting_password} onChange={(e) => update('meeting_password', e.target.value)} />
              </FormField>
            </>
          )}
        </div>
      </Card>

      <Card title={t('dashboardInstructor.scheduleLiveClass.additionalInformation')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.scheduleLiveClass.maxParticipants')} hint={t('dashboardInstructor.scheduleLiveClass.optional')}>
            <Input type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} />
          </FormField>
          <FormField label={t('dashboardInstructor.scheduleLiveClass.recordingUrl')} hint={t('dashboardInstructor.scheduleLiveClass.recordingUrlHint')}>
            <Input value={form.recording_url} onChange={(e) => update('recording_url', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>{t('dashboardInstructor.scheduleLiveClass.cancel')}</Button>
        <Button type="button" loading={loading} disabled={loading} onClick={handleSubmit}>
          {loading ? (isEdit ? t('dashboardInstructor.scheduleLiveClass.saving') : t('dashboardInstructor.scheduleLiveClass.scheduling')) : isEdit ? t('dashboardInstructor.scheduleLiveClass.saveChanges') : t('dashboardInstructor.scheduleLiveClass.scheduleClass')}
        </Button>
      </div>
    </div>
  )
}
