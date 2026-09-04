import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cancelLiveClass, completeLiveClass, getLiveClasses } from '../../services/liveClassService'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { IconPlus } from '../../components/icons'

const statusTone = { scheduled: 'brand', live: 'success', completed: 'neutral', cancelled: 'danger', postponed: 'warning' }
const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']

export default function LiveClassesList() {
  const { user } = useAuth()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getLiveClasses({ page_size: 100 })
      setSessions(data.results ?? data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCancel(session) {
    if (!window.confirm(`Cancel "${session.title}"?`)) return
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Live Classes"
        description={`${sessions.length} session${sessions.length === 1 ? '' : 's'}`}
        actions={canManage ? <Button as={Link} to="/dashboard/live-classes/create"><IconPlus className="h-4 w-4" /> Schedule Class</Button> : null}
      />

      <DataTable
        loading={loading}
        rows={sessions}
        emptyMessage="No live classes scheduled yet."
        columns={[
          { key: 'title', label: 'Session', render: (s) => <span className="font-semibold text-navy-900">{s.title}</span> },
          { key: 'instructor', label: 'Instructor', render: (s) => s.instructor?.full_name ?? '—' },
          { key: 'scheduled_date', label: 'Date', render: (s) => s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString() : '—' },
          { key: 'start_time', label: 'Time', render: (s) => `${s.start_time?.slice(0, 5) ?? ''} – ${s.end_time?.slice(0, 5) ?? ''} ${s.timezone ?? ''}` },
          { key: 'meeting_platform', label: 'Platform', render: (s) => <span className="capitalize">{s.meeting_platform?.replace('_', ' ')}</span> },
          { key: 'status', label: 'Status', render: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge> },
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
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
