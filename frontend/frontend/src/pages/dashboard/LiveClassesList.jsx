import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useLanguage } from '../../context/LanguageContext'
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
  const { t } = useLanguage()
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
    const { confirmed } = await confirm({
      message: t('dashboardStudent.liveClassesList.confirmCancel', { title: session.title }),
      tone: 'default',
      confirmLabel: t('dashboardStudent.liveClassesList.cancelClass'),
      cancelLabel: t('dashboardStudent.liveClassesList.keepIt'),
    })
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
    const { confirmed, reason } = await confirm(t('dashboardStudent.liveClassesList.confirmDelete', { title: session.title }))
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
        title={t('dashboardStudent.liveClassesList.heading')}
        description={t('dashboardStudent.liveClassesList.sessionCount', { count })}
        actions={canManage ? <Button as={Link} to="/dashboard/live-classes/create"><IconPlus className="h-4 w-4" /> {t('dashboardStudent.liveClassesList.scheduleClass')}</Button> : null}
      />

      <DataTable
        loading={loading}
        rows={sessions}
        page={page}
        total={count}
        onPageChange={setPage}
        emptyMessage={t('dashboardStudent.liveClassesList.emptyMessage')}
        search={{ value: search, onChange: setSearch, placeholder: t('dashboardStudent.liveClassesList.searchPlaceholder') }}
        filters={[
          {
            label: t('dashboardStudent.liveClassesList.status'),
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: t('dashboardStudent.liveClassesList.allStatuses') },
              { value: 'scheduled', label: t('dashboardStudent.liveClassesList.scheduled') },
              { value: 'live', label: t('dashboardStudent.liveClassesList.live') },
              { value: 'completed', label: t('dashboardStudent.liveClassesList.completed') },
              { value: 'cancelled', label: t('dashboardStudent.liveClassesList.cancelled') },
              { value: 'postponed', label: t('dashboardStudent.liveClassesList.postponed') },
            ],
          },
        ]}
        exportFilename="live-classes"
        exportTitle={t('dashboardStudent.liveClassesList.heading')}
        columns={[
          { key: 'title', label: t('dashboardStudent.liveClassesList.columnSession'), render: (s) => <span className="font-semibold text-navy-900 dark:text-white">{s.title}</span> },
          { key: 'instructor', label: t('dashboardStudent.liveClassesList.columnInstructor'), render: (s) => s.instructor?.full_name ?? '—', exportValue: (s) => s.instructor?.full_name ?? '' },
          { key: 'scheduled_date', label: t('dashboardStudent.liveClassesList.columnDate'), render: (s) => s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString() : '—' },
          {
            key: 'start_time', label: t('dashboardStudent.liveClassesList.columnTime'),
            render: (s) => `${s.start_time?.slice(0, 5) ?? ''} – ${s.end_time?.slice(0, 5) ?? ''} ${s.timezone ?? ''}`,
          },
          { key: 'meeting_platform', label: t('dashboardStudent.liveClassesList.columnPlatform'), render: (s) => <span className="capitalize">{s.meeting_platform?.replace('_', ' ')}</span>, exportValue: (s) => s.meeting_platform },
          { key: 'status', label: t('dashboardStudent.liveClassesList.status'), render: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge>, exportValue: (s) => s.status },
          {
            key: 'actions',
            label: '',
            render: (s) => (
              <div className="flex items-center justify-end gap-2">
                {s.status !== 'cancelled' && s.meeting_platform === 'in_app' && (
                  <Link to={`/dashboard/live-classes/${s.id}/room`} className="text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">{t('dashboardStudent.liveClassesList.join')}</Link>
                )}
                {s.status !== 'cancelled' && s.meeting_platform !== 'in_app' && s.meeting_url && (
                  <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">{t('dashboardStudent.liveClassesList.join')}</a>
                )}
                {canManage && s.status === 'scheduled' && (
                  <>
                    <Button size="sm" variant="secondary" disabled={busyId === s.id} onClick={() => handleComplete(s)}>{t('dashboardStudent.liveClassesList.complete')}</Button>
                    <Button size="sm" variant="danger" disabled={busyId === s.id} onClick={() => handleCancel(s)}>{t('dashboardStudent.liveClassesList.cancel')}</Button>
                  </>
                )}
                {canManage && (
                  <>
                    <Link to={`/dashboard/live-classes/${s.id}/edit`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardStudent.liveClassesList.editLiveClass')}>
                      <IconEdit className="h-4 w-4" />
                    </Link>
                    <button type="button" disabled={busyId === s.id} onClick={() => handleDelete(s)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" aria-label={t('dashboardStudent.liveClassesList.deleteLiveClass')}>
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
