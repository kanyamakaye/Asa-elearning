import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { deleteExam, listExams, updateExam } from '../../lib/dashboardApi'
import useCourseOptions from '../../hooks/useCourseOptions'
import DataTable from '../../components/dashboard/DataTable'
import ExamForm, { examToFormShape } from '../../components/dashboard/ExamForm'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { IconClipboard, IconEdit, IconPlay, IconPlus, IconTrash } from '../../components/icons'

const statusTone = { scheduled: 'brand', active: 'success', completed: 'neutral', cancelled: 'danger' }
const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']

export default function ExamsList() {
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()
  const confirm = useConfirm()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const { courses } = useCourseOptions()
  const [exams, setExams] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [editingExam, setEditingExam] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    listExams(accessToken, { page, ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) })
      .then((data) => {
        setExams(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { setPage(1) }, [status, search])
  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, page, status, search])

  async function remove(exam) {
    const { confirmed, reason } = await confirm(`Delete exam "${exam.title}"?`)
    if (!confirmed) return
    setBusyId(exam.id)
    try {
      await deleteExam(exam.id, accessToken, reason)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function saveEdit(form) {
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
      await updateExam(editingExam.id, payload, accessToken)
      setEditingExam(null)
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
        actions={canManage ? <Button onClick={() => navigate('/dashboard/exams/create')}><IconPlus className="h-4 w-4" /> Schedule Exam</Button> : null}
      />

      <DataTable
        loading={loading}
        rows={exams}
        page={page}
        total={count}
        onPageChange={setPage}
        emptyMessage="No exams scheduled yet."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by title…' }}
        filters={canManage ? [
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: 'All statuses' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
        ] : undefined}
        exportFilename="exams"
        exportTitle="Exams"
        columns={[
          { key: 'title', label: 'Title', render: (e) => <span className="font-semibold text-navy-900">{e.title}</span> },
          { key: 'exam_date', label: 'Date', render: (e) => e.exam_date ? new Date(e.exam_date).toLocaleDateString() : '—' },
          { key: 'passing_marks', label: 'Passing', render: (e) => `${e.passing_marks}/${e.total_marks}` },
          ...(canManage ? [{ key: 'question_count', label: 'Questions', render: (e) => e.question_count ?? 0 }] : []),
          { key: 'status', label: 'Status', render: (e) => <Badge tone={statusTone[e.status]}>{e.status}</Badge>, exportValue: (e) => e.status },
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
                    <button type="button" onClick={() => setEditingExam(e)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit exam">
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

      <Modal open={!!editingExam} onClose={() => setEditingExam(null)} title="Edit Exam" size="lg">
        {editingExam && (
          <ExamForm
            initial={examToFormShape(editingExam)}
            courses={courses}
            onSave={saveEdit}
            onCancel={() => setEditingExam(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  )
}
