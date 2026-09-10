import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createExam, deleteExam, listExams, updateExam } from '../../lib/dashboardApi'
import useCourseOptions from '../../hooks/useCourseOptions'
import DataTable from '../../components/dashboard/DataTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { IconClipboard, IconEdit, IconPlay, IconPlus, IconTrash } from '../../components/icons'

const statusTone = { scheduled: 'brand', active: 'success', completed: 'neutral', cancelled: 'danger' }
const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']

const EMPTY_FORM = {
  course: '', title: '', description: '', exam_date: '', start_time: '', end_time: '',
  duration_minutes: '60', total_marks: '100', passing_marks: '50', attempt_limit: '1', status: 'scheduled',
}

function ExamForm({ initial, courses, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

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
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save Exam'}</Button>
      </div>
    </div>
  )
}

function toFormShape(exam) {
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

export default function ExamsList() {
  const { accessToken, user } = useAuth()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const { courses } = useCourseOptions()
  const [exams, setExams] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', exam? }
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await listExams(accessToken, { page })
      setExams(data.results ?? data)
      setCount(data.count ?? (data.results ?? data).length)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accessToken, page]) // eslint-disable-line react-hooks/exhaustive-deps

  async function remove(exam) {
    if (!window.confirm(`Delete exam "${exam.title}"?`)) return
    setBusyId(exam.id)
    try {
      await deleteExam(exam.id, accessToken)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function save(form) {
    setSaving(true)
    try {
      // DRF's Date/TimeField reject an empty string outright (unlike a
      // missing key) — these are all optional, so blank out to null instead.
      const payload = {
        ...form,
        exam_date: form.exam_date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      }
      if (modal.mode === 'create') await createExam(payload, accessToken)
      else await updateExam(modal.exam.id, payload, accessToken)
      setModal(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Exams"
        description={`${count} exam${count === 1 ? '' : 's'}`}
        actions={canManage ? <Button onClick={() => setModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Schedule Exam</Button> : null}
      />

      <DataTable
        loading={loading}
        rows={exams}
        page={page}
        total={count}
        onPageChange={setPage}
        emptyMessage="No exams scheduled yet."
        columns={[
          { key: 'title', label: 'Title', render: (e) => <span className="font-semibold text-navy-900">{e.title}</span> },
          { key: 'exam_date', label: 'Date', render: (e) => e.exam_date ? new Date(e.exam_date).toLocaleDateString() : '—' },
          { key: 'passing_marks', label: 'Passing', render: (e) => `${e.passing_marks}/${e.total_marks}` },
          ...(canManage ? [{ key: 'question_count', label: 'Questions', render: (e) => e.question_count ?? 0 }] : []),
          { key: 'status', label: 'Status', render: (e) => <Badge tone={statusTone[e.status]}>{e.status}</Badge> },
          {
            key: 'actions',
            label: '',
            render: (e) => (
              <div className="flex items-center justify-end gap-2">
                {canManage ? (
                  <>
                    <Link to={`/dashboard/exams/${e.id}/questions`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Manage questions">
                      <IconClipboard className="h-4 w-4" />
                    </Link>
                    <button type="button" onClick={() => setModal({ mode: 'edit', exam: e })} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit exam">
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={busyId === e.id} onClick={() => remove(e)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete exam">
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </>
                ) : e.status === 'active' ? (
                  <Button as={Link} to={`/dashboard/exams/${e.id}/take`} size="sm">
                    <IconPlay className="h-3.5 w-3.5" /> Take Exam
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Schedule Exam' : 'Edit Exam'} size="lg">
        {modal && (
          <ExamForm
            initial={modal.mode === 'edit' ? toFormShape(modal.exam) : EMPTY_FORM}
            courses={courses}
            onSave={save}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  )
}
