import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useLanguage } from '../../context/LanguageContext'
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
  const confirm = useConfirm()
  const { t } = useLanguage()
  const [allAssignments, setAllAssignments] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
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

  const filteredAssignments = allAssignments.filter((a) => {
    if (status && a.status !== status) return false
    const term = search.trim().toLowerCase()
    return !term || a.title?.toLowerCase().includes(term)
  })
  useEffect(() => { setPage(1) }, [search, status])
  const assignments = filteredAssignments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
    const { confirmed, reason } = await confirm(t('dashboardStudent.assignmentsList.confirmDelete', { title: assignment.title }))
    if (!confirmed) return
    setBusyId(assignment.id)
    try {
      await deleteAssignment(assignment.id, reason)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('dashboardStudent.assignmentsList.heading')}
        description={t('dashboardStudent.assignmentsList.assignmentCount', { count: allAssignments.length })}
        actions={<Button as={Link} to="/dashboard/assignments/create"><IconPlus className="h-4 w-4" /> {t('dashboardStudent.assignmentsList.createAssignment')}</Button>}
      />

      <DataTable
        loading={loading}
        rows={assignments}
        page={page}
        total={filteredAssignments.length}
        onPageChange={setPage}
        emptyMessage={t('dashboardStudent.assignmentsList.emptyMessage')}
        search={{ value: search, onChange: setSearch, placeholder: t('dashboardStudent.assignmentsList.searchPlaceholder') }}
        filters={[
          {
            label: t('dashboardStudent.assignmentsList.status'),
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: t('dashboardStudent.assignmentsList.allStatuses') },
              { value: 'draft', label: t('dashboardStudent.assignmentsList.draft') },
              { value: 'published', label: t('dashboardStudent.assignmentsList.published') },
              { value: 'closed', label: t('dashboardStudent.assignmentsList.closed') },
            ],
          },
        ]}
        exportRows={filteredAssignments}
        exportFilename="assignments"
        exportTitle={t('dashboardStudent.assignmentsList.heading')}
        columns={[
          { key: 'title', label: t('dashboardStudent.assignmentsList.columnTitle'), render: (a) => <span className="font-semibold text-navy-900 dark:text-white">{a.title}</span> },
          { key: 'due_date', label: t('dashboardStudent.assignmentsList.columnDue'), render: (a) => a.due_date ? new Date(a.due_date).toLocaleDateString() : '—' },
          { key: 'maximum_marks', label: t('dashboardStudent.assignmentsList.columnMarks'), render: (a) => `${a.passing_marks}/${a.maximum_marks}` },
          { key: 'submission_count', label: t('dashboardStudent.assignmentsList.columnSubmissions') },
          { key: 'status', label: t('dashboardStudent.assignmentsList.status'), render: (a) => <Badge tone={statusTone[a.status]}>{a.status}</Badge>, exportValue: (a) => a.status },
          {
            key: 'actions',
            label: '',
            render: (a) => (
              <div className="flex items-center justify-end gap-2">
                {a.status === 'draft' && (
                  <Button size="sm" variant="secondary" disabled={busyId === a.id} onClick={() => handlePublish(a.id)}>
                    {t('dashboardStudent.assignmentsList.publish')}
                  </Button>
                )}
                <Link to={`/dashboard/assignments/${a.id}/submissions`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardStudent.assignmentsList.viewSubmissions')}>
                  <IconClipboard className="h-4 w-4" />
                </Link>
                <Link to={`/dashboard/assignments/${a.id}/edit`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardStudent.assignmentsList.editAssignment')}>
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === a.id} onClick={() => handleDelete(a)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" aria-label={t('dashboardStudent.assignmentsList.deleteAssignment')}>
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
