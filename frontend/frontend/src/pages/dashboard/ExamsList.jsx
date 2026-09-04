import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { deleteExam, listExams } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import { IconTrash } from '../../components/icons'

const statusTone = { scheduled: 'brand', active: 'success', completed: 'neutral', cancelled: 'danger' }
const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']

export default function ExamsList() {
  const { accessToken, user } = useAuth()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await listExams(accessToken)
      setExams(data.results ?? data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="space-y-4">
      <PageHeader title="Exams" description={`${exams.length} exam${exams.length === 1 ? '' : 's'}`} />

      <DataTable
        loading={loading}
        rows={exams}
        emptyMessage="No exams scheduled yet."
        columns={[
          { key: 'title', label: 'Title', render: (e) => <span className="font-semibold text-navy-900">{e.title}</span> },
          { key: 'exam_date', label: 'Date', render: (e) => e.exam_date ? new Date(e.exam_date).toLocaleDateString() : '—' },
          { key: 'passing_marks', label: 'Passing', render: (e) => `${e.passing_marks}/${e.total_marks}` },
          { key: 'status', label: 'Status', render: (e) => <Badge tone={statusTone[e.status]}>{e.status}</Badge> },
          ...(canManage ? [{
            key: 'actions',
            label: '',
            render: (e) => (
              <button type="button" disabled={busyId === e.id} onClick={() => remove(e)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete exam">
                <IconTrash className="h-4 w-4" />
              </button>
            ),
          }] : []),
        ]}
      />
    </div>
  )
}
