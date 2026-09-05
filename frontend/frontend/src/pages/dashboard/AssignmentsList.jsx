import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deleteAssignment, getAssignments, publishAssignment } from '../../services/assignmentService'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { IconClipboard, IconEdit, IconPlus, IconTrash } from '../../components/icons'

const statusTone = { draft: 'warning', published: 'success', closed: 'neutral' }
const PAGE_SIZE = 20

export default function AssignmentsList() {
  const { user } = useAuth()
  const [allAssignments, setAllAssignments] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const isManager = user?.user_type === 'admin' || user?.user_type === 'academic_manager'

  async function load() {
    setLoading(true)
    try {
      const data = await getAssignments({ page_size: 200 })
      let rows = data.results ?? data
      if (!isManager) rows = rows.filter((a) => a.created_by === user?.id)
      setAllAssignments(rows)
      setPage(1)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const assignments = allAssignments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handlePublish(id) {
    setBusyId(id)
    try {
      await publishAssignment(id)
      await load()
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(assignment) {
    if (!window.confirm(`Delete assignment "${assignment.title}"? This cannot be undone.`)) return
    setBusyId(assignment.id)
    try {
      await deleteAssignment(assignment.id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assignments"
        description={`${allAssignments.length} assignment${allAssignments.length === 1 ? '' : 's'}`}
        actions={<Button as={Link} to="/dashboard/assignments/create"><IconPlus className="h-4 w-4" /> Create Assignment</Button>}
      />

      <DataTable
        loading={loading}
        rows={assignments}
        page={page}
        total={allAssignments.length}
        onPageChange={setPage}
        emptyMessage="No assignments yet. Create your first one."
        columns={[
          { key: 'title', label: 'Title', render: (a) => <span className="font-semibold text-navy-900">{a.title}</span> },
          { key: 'due_date', label: 'Due', render: (a) => a.due_date ? new Date(a.due_date).toLocaleDateString() : '—' },
          { key: 'maximum_marks', label: 'Marks', render: (a) => `${a.passing_marks}/${a.maximum_marks}` },
          { key: 'submission_count', label: 'Submissions' },
          { key: 'status', label: 'Status', render: (a) => <Badge tone={statusTone[a.status]}>{a.status}</Badge> },
          {
            key: 'actions',
            label: '',
            render: (a) => (
              <div className="flex items-center justify-end gap-2">
                {a.status === 'draft' && (
                  <Button size="sm" variant="secondary" disabled={busyId === a.id} onClick={() => handlePublish(a.id)}>
                    Publish
                  </Button>
                )}
                <Link to={`/dashboard/assignments/${a.id}/submissions`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="View submissions">
                  <IconClipboard className="h-4 w-4" />
                </Link>
                <Link to={`/dashboard/assignments/${a.id}/edit`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit assignment">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === a.id} onClick={() => handleDelete(a)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete assignment">
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
