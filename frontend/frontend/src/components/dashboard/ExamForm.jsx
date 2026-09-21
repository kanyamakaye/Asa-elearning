import { useMemo, useState } from 'react'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'

export const EMPTY_EXAM_FORM = {
  course: '', title: '', description: '', exam_date: '', start_time: '', end_time: '',
  duration_minutes: '60', total_marks: '100', passing_marks: '50', attempt_limit: '1', status: 'scheduled',
}

export function examToFormShape(exam) {
  return {
    course: exam.course,
    title: exam.title,
    description: exam.description ?? '',
    exam_date: exam.exam_date ?? '',
    start_time: exam.start_time?.slice(0, 5) ?? '',
    end_time: exam.end_time?.slice(0, 5) ?? '',
    duration_minutes: String(exam.duration_minutes),
    total_marks: String(exam.total_marks),
    passing_marks: String(exam.passing_marks),
    attempt_limit: String(exam.attempt_limit),
    status: exam.status,
  }
}

export default function ExamForm({ initial, courses, onSave, onCancel, saving, submitLabel = 'Save Exam' }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial])
  useUnsavedChanges(dirty)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit() {
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.course) return setError('Course is required.')
    if (Number(form.passing_marks) > Number(form.total_marks)) return setError('Passing marks cannot exceed total marks.')
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" required className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => update('title', e.target.value)} autoFocus />
        </FormField>
        <FormField label="Course" required>
          <Select value={form.course} onChange={(e) => update('course', e.target.value)}>
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Date">
          <Input type="date" value={form.exam_date} onChange={(e) => update('exam_date', e.target.value)} />
        </FormField>
        <FormField label="Start Time">
          <Input type="time" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} />
        </FormField>
        <FormField label="End Time">
          <Input type="time" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <FormField label="Duration (min)">
          <Input type="number" min="0" value={form.duration_minutes} onChange={(e) => update('duration_minutes', e.target.value)} />
        </FormField>
        <FormField label="Total Marks">
          <Input type="number" min="1" value={form.total_marks} onChange={(e) => update('total_marks', e.target.value)} />
        </FormField>
        <FormField label="Passing Marks">
          <Input type="number" min="0" value={form.passing_marks} onChange={(e) => update('passing_marks', e.target.value)} />
        </FormField>
        <FormField label="Attempts">
          <Input type="number" min="1" value={form.attempt_limit} onChange={(e) => update('attempt_limit', e.target.value)} />
        </FormField>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : submitLabel}</Button>
      </div>
    </div>
  )
}
