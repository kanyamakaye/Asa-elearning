import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { cancelLiveClass, completeLiveClass, deleteLiveClass, getLiveClasses } from '../../services/liveClassService'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { IconEdit, IconPlus, IconTrash } from '../../components/icons'

const statusTone = { scheduled: 'brand', live: 'success', completed: 'neutral', cancelled: 'danger', postponed: 'warning' }
const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']

export default function LiveClassesList() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const [sessions, setSessions] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    getLiveClasses({ page, ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) })
      .then((data) => {
        setSessions(data.results ?? data)
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
  }, [page, status, search])

  async function handleCancel(session) {
    const { confirmed } = await confirm({ message: `Cancel "${session.title}"?`, tone: 'default', confirmLabel: 'Cancel Class', cancelLabel: 'Keep It' })
    if (!confirmed) return
    setBusyId(session.id)
    try {
      await cancelLiveClass(session.id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleComplete(session) {
    setBusyId(session.id)
    try {
      await completeLiveClass(session.id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(session) {
    const { confirmed, reason } = await confirm(`Delete "${session.title}"? This cannot be undone.`)
    if (!confirmed) return
    setBusyId(session.id)
    try {
      await deleteLiveClass(session.id, reason)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Live Classes"
        description={`${count} session${count === 1 ? '' : 's'}`}
        actions={canManage ? <Button as={Link} to="/dashboard/live-classes/create"><IconPlus className="h-4 w-4" /> Schedule Class</Button> : null}
      />

      <DataTable
        loading={loading}
        rows={sessions}
        page={page}
        total={count}
        onPageChange={setPage}
        emptyMessage="No live classes scheduled yet."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by title…' }}
        filters={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: 'All statuses' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'live', label: 'Live' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'postponed', label: 'Postponed' },
            ],
          },
        ]}
        exportFilename="live-classes"
        exportTitle="Live Classes"
        columns={[
          { key: 'title', label: 'Session', render: (s) => <span className="font-semibold text-navy-900">{s.title}</span> },
          { key: 'instructor', label: 'Instructor', render: (s) => s.instructor?.full_name ?? '—', exportValue: (s) => s.instructor?.full_name ?? '' },
          { key: 'scheduled_date', label: 'Date', render: (s) => s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString() : '—' },
          {
            key: 'start_time', label: 'Time',
            render: (s) => `${s.start_time?.slice(0, 5) ?? ''} – ${s.end_time?.slice(0, 5) ?? ''} ${s.timezone ?? ''}`,
          },
          { key: 'meeting_platform', label: 'Platform', render: (s) => <span className="capitalize">{s.meeting_platform?.replace('_', ' ')}</span>, exportValue: (s) => s.meeting_platform },
          { key: 'status', label: 'Status', render: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge>, exportValue: (s) => s.status },
          {
            key: 'actions',
            label: '',
            render: (s) => (
              <div className="flex items-center justify-end gap-2">
                {s.meeting_url && s.status !== 'cancelled' && (
                  <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-500 hover:text-navy-900">Join</a>
                )}
                {canManage && s.status === 'scheduled' && (
                  <>
                    <Button size="sm" variant="secondary" disabled={busyId === s.id} onClick={() => handleComplete(s)}>Complete</Button>
                    <Button size="sm" variant="danger" disabled={busyId === s.id} onClick={() => handleCancel(s)}>Cancel</Button>
                  </>
                )}
                {canManage && (
                  <>
                    <Link to={`/dashboard/live-classes/${s.id}/edit`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit live class">
                      <IconEdit className="h-4 w-4" />
                    </Link>
                    <button type="button" disabled={busyId === s.id} onClick={() => handleDelete(s)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete live class">
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
