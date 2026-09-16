import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfirm } from '../../context/ConfirmContext'
import { deleteGroup, getGroups } from '../../services/groupService'
import DataTable from '../../components/dashboard/DataTable'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { IconBook, IconEdit, IconPlus, IconTrash, IconUsers } from '../../components/icons'

export default function GroupsList() {
  const confirm = useConfirm()
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    getGroups({ page_size: 100, ...(search.trim() ? { search: search.trim() } : {}) })
      .then((data) => setGroups(data.results ?? data))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleDelete(group) {
    const { confirmed, reason } = await confirm(`Delete group "${group.name}"? This cannot be undone.`)
    if (!confirmed) return
    setBusyId(group.id)
    try {
      await deleteGroup(group.id, reason)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Groups"
        description="Organize students into classes or cohorts for reporting and communication."
        actions={<Button as={Link} to="/dashboard/groups/create"><IconPlus className="h-4 w-4" /> New Group</Button>}
      />

      <DataTable
        loading={loading}
        rows={groups}
        emptyMessage="No groups yet. Create your first one."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by name…' }}
        exportFilename="groups"
        exportTitle="Groups"
        columns={[
          { key: 'name', label: 'Name', render: (g) => <span className="font-semibold text-navy-900">{g.name}</span> },
          {
            key: 'courses', label: 'Courses',
            render: (g) => (
              <span className="inline-flex items-center gap-1.5" title={(g.courses ?? []).map((c) => c.title).join(', ')}>
                <IconBook className="h-3.5 w-3.5 text-navy-700/40" /> {g.course_count ?? g.courses?.length ?? 0}
              </span>
            ),
            exportValue: (g) => g.course_count ?? g.courses?.length ?? 0,
          },
          { key: 'instructor_detail', label: 'Instructor', render: (g) => g.instructor_detail?.full_name ?? '—', exportValue: (g) => g.instructor_detail?.full_name ?? '' },
          {
            key: 'member_count', label: 'Members',
            render: (g) => (
              <span className="inline-flex items-center gap-1.5"><IconUsers className="h-3.5 w-3.5 text-navy-700/40" /> {g.member_count}</span>
            ),
          },
          {
            key: 'actions',
            label: '',
            render: (g) => (
              <div className="flex items-center justify-end gap-2">
                <Link to={`/dashboard/groups/${g.id}`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Manage members">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === g.id} onClick={() => handleDelete(g)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete group">
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
