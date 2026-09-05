import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  meeting_platform: 'zoom',
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
    if (!form.course) next.course = 'This field is required.'
    if (!form.title.trim()) next.title = 'This field is required.'
    if (!form.scheduled_date) next.scheduled_date = 'This field is required.'
    if (!form.start_time) next.start_time = 'This field is required.'
    if (!form.end_time) next.end_time = 'This field is required.'
    if (form.start_time && form.end_time && form.end_time <= form.start_time) next.end_time = 'Must be after the start time.'
    if (!form.meeting_url.trim()) next.meeting_url = 'This field is required.'
    else {
      try {
        new URL(form.meeting_url)
      } catch {
        next.meeting_url = 'Enter a valid URL.'
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

  if (initialLoading) return <LoadingSpinner label="Loading live class…" />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={`Live class ${isEdit ? 'updated' : 'scheduled'} successfully.`}>
          {isEdit ? 'Redirecting…' : 'Enrolled students have been notified. Redirecting…'}
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Live Classes', to: '/dashboard/live-classes' }, { label: isEdit ? 'Edit Live Class' : 'Schedule Live Class' }]} />}
        title={isEdit ? 'Edit Live Class' : 'Schedule a Live Class'}
        description="Set up a live session for your students. A meeting link is entered manually — no Zoom/Meet integration is required."
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title="Session Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Course" required error={errors.course}>
            <Select value={form.course} onChange={(e) => update('course', e.target.value)} error={errors.course}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Instructor">
            <Input value={user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : user?.username ?? ''} disabled />
          </FormField>
          <FormField label="Session Title" required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title="Schedule">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Date" required error={errors.scheduled_date}>
            <Input type="date" value={form.scheduled_date} onChange={(e) => update('scheduled_date', e.target.value)} error={errors.scheduled_date} />
          </FormField>
          <FormField label="Timezone" required>
            <Select value={form.timezone} onChange={(e) => update('timezone', e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </Select>
          </FormField>
          <FormField label="Start Time" required error={errors.start_time}>
            <Input type="time" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} error={errors.start_time} />
          </FormField>
          <FormField label="End Time" required error={errors.end_time}>
            <Input type="time" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} error={errors.end_time} />
          </FormField>
        </div>
      </Card>

      <Card title="Meeting Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Platform" required>
            <Select value={form.meeting_platform} onChange={(e) => update('meeting_platform', e.target.value)}>
              <option value="zoom">Zoom</option>
              <option value="google_meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Meeting URL" required error={errors.meeting_url}>
            <Input value={form.meeting_url} onChange={(e) => update('meeting_url', e.target.value)} placeholder="https://" error={errors.meeting_url} />
          </FormField>
          <FormField label="Meeting ID" hint="Optional">
            <Input value={form.meeting_id} onChange={(e) => update('meeting_id', e.target.value)} />
          </FormField>
          <FormField label="Meeting Password" hint="Optional">
            <Input value={form.meeting_password} onChange={(e) => update('meeting_password', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title="Additional Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Maximum Participants" hint="Optional">
            <Input type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} />
          </FormField>
          <FormField label="Recording URL" hint="Optional, add after the session.">
            <Input value={form.recording_url} onChange={(e) => update('recording_url', e.target.value)} />
          </FormField>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
        <Button type="button" loading={loading} disabled={loading} onClick={handleSubmit}>
          {loading ? (isEdit ? 'Saving…' : 'Scheduling Class…') : isEdit ? 'Save Changes' : 'Schedule Class'}
        </Button>
      </div>
    </div>
  )
}
