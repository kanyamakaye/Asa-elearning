import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listUsers } from '../../lib/dashboardApi'
import { addGroupMember, getGroup, removeGroupMember } from '../../services/groupService'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import { IconPlus, IconSearch, IconTrash, IconUsers } from '../../components/icons'

function Avatar({ user }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xs font-bold text-navy-700">
      {user.profile_picture ? (
        <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
      ) : (
        (user.full_name || user.username || '?')[0]?.toUpperCase()
      )}
    </div>
  )
}

export default function GroupDetail() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    getGroup(id)
      .then((data) => setGroup(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return undefined
    }
    const timer = setTimeout(() => {
      setSearching(true)
      listUsers(accessToken, { role: 'student', search: query, page_size: 8 })
        .then((data) => setResults(data.results ?? data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query, accessToken])

  const memberIds = new Set((group?.memberships ?? []).map((m) => m.student.id))

  async function handleAdd(studentId) {
    setBusyId(studentId)
    try {
      await addGroupMember(id, studentId)
      setQuery('')
      setResults([])
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(studentId) {
    setBusyId(studentId)
    try {
      await removeGroupMember(id, studentId)
      load()
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading group…" />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Groups', to: '/dashboard/groups' }, { label: group?.name ?? 'Group' }]} />}
        title={group?.name}
        description={group?.description || (group?.course_title ? `Scoped to ${group.course_title}` : 'No description')}
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="text-sm font-bold text-navy-900">Add a Student</h2>
        <div className="relative mt-3">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700/35" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name or email…"
            className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {query.trim() && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl ring-1 ring-navy-900/8">
            {searching ? (
              <p className="px-4 py-4 text-center text-sm text-navy-700/45">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-4 text-center text-sm text-navy-700/45">No matching students found.</p>
            ) : (
              results.map((student) => {
                const alreadyIn = memberIds.has(student.id)
                return (
                  <div key={student.id} className="flex items-center gap-2.5 border-b border-navy-900/6 px-3.5 py-2.5 last:border-0">
                    <Avatar user={student} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900">{student.full_name}</p>
                      <p className="truncate text-xs text-navy-700/50">{student.email}</p>
                    </div>
                    <Button size="sm" variant={alreadyIn ? 'secondary' : 'primary'} disabled={alreadyIn || busyId === student.id} onClick={() => handleAdd(student.id)}>
                      {alreadyIn ? 'Added' : <><IconPlus className="h-3.5 w-3.5" /> Add</>}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <IconUsers className="h-4 w-4 text-navy-700/40" /> Members ({group?.memberships?.length ?? 0})
        </h2>
        {(group?.memberships ?? []).length === 0 ? (
          <p className="mt-3 rounded-xl bg-navy-50 p-4 text-center text-sm text-navy-700/50">No students in this group yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {group.memberships.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5 rounded-xl bg-navy-50/60 px-3.5 py-2.5">
                <Avatar user={m.student} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900">{m.student.full_name}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId === m.student.id}
                  onClick={() => handleRemove(m.student.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                  aria-label="Remove from group"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
