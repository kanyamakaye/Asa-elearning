import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createUser, listUsers } from '../../lib/dashboardApi'
import useCourseOptions from '../../hooks/useCourseOptions'
import {
  addGroupMember,
  assignGroupCourse,
  getGroup,
  removeGroupCourse,
  removeGroupMember,
} from '../../services/groupService'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import { IconBook, IconPlus, IconSearch, IconTrash, IconUsers } from '../../components/icons'

const EMPTY_NEW_STUDENT = { first_name: '', last_name: '', username: '', email: '', password: '' }

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
  const { accessToken, user } = useAuth()
  const isAdmin = user?.user_type === 'admin'
  const { courses: allCourses } = useCourseOptions()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [courseQuery, setCourseQuery] = useState('')
  const [busyCourseId, setBusyCourseId] = useState(null)

  const [allStudents, setAllStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [bulkAdding, setBulkAdding] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newStudent, setNewStudent] = useState(EMPTY_NEW_STUDENT)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  function load() {
    setLoading(true)
    getGroup(id)
      .then((data) => setGroup(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Loaded once, up front, so every student can be browsed/selected instead
  // of only whatever a search query happens to match.
  useEffect(() => {
    setStudentsLoading(true)
    listUsers(accessToken, { role: 'student', page_size: 500 })
      .then((data) => setAllStudents(data.results ?? data))
      .catch(() => setAllStudents([]))
      .finally(() => setStudentsLoading(false))
  }, [accessToken])

  const memberIds = new Set((group?.memberships ?? []).map((m) => m.student.id))
  const assignedCourseIds = new Set((group?.courses ?? []).map((c) => c.id))
  const courseMatches = useMemo(() => {
    const q = courseQuery.trim().toLowerCase()
    if (!q) return []
    return allCourses.filter((c) => !assignedCourseIds.has(c.id) && c.title.toLowerCase().includes(q)).slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseQuery, allCourses, group])

  const addableStudents = useMemo(
    () => allStudents.filter((s) => !memberIds.has(s.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allStudents, group]
  )
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return addableStudents
    return addableStudents.filter((s) =>
      s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q)
    )
  }, [addableStudents, query])
  const allVisibleSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selectedIds.has(s.id))

  function toggleSelect(studentId) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredStudents.forEach((s) => (allVisibleSelected ? next.delete(s.id) : next.add(s.id)))
      return next
    })
  }

  function updateNewStudent(field, value) {
    setNewStudent((f) => ({ ...f, [field]: value }))
  }

  async function handleAssignCourse(courseId) {
    setBusyCourseId(courseId)
    try {
      await assignGroupCourse(id, courseId)
      setCourseQuery('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyCourseId(null)
    }
  }

  async function handleRemoveCourse(courseId) {
    setBusyCourseId(courseId)
    try {
      await removeGroupCourse(id, courseId)
      load()
    } finally {
      setBusyCourseId(null)
    }
  }

  async function handleAdd(studentId) {
    setBusyId(studentId)
    try {
      await addGroupMember(id, studentId)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleBulkAdd() {
    if (selectedIds.size === 0) return
    setBulkAdding(true)
    setError('')
    try {
      await Promise.all([...selectedIds].map((studentId) => addGroupMember(id, studentId)))
      setSelectedIds(new Set())
      load()
    } catch (err) {
      setError(err.message || 'Could not add the selected students.')
    } finally {
      setBulkAdding(false)
    }
  }

  async function handleCreateStudent() {
    if (!newStudent.username.trim() || !newStudent.email.trim() || !newStudent.password.trim()) {
      setCreateError('Username, email, and password are required.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const created = await createUser({ ...newStudent, user_type: 'student', status: 'active' }, accessToken)
      await addGroupMember(id, created.id)
      setAllStudents((prev) => [...prev, created])
      setNewStudent(EMPTY_NEW_STUDENT)
      setShowCreateForm(false)
      load()
    } catch (err) {
      setCreateError(err.message || 'Could not create this student.')
      if (err.errors) setCreateError(Object.values(err.errors).flat().join(' '))
    } finally {
      setCreating(false)
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
        description={
          group?.description
          || (group?.courses?.length ? `Assigned to ${group.courses.map((c) => c.title).join(', ')}` : 'No description')
        }
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-navy-900">Add Students</h2>
          {selectedIds.size > 0 && (
            <Button size="sm" loading={bulkAdding} disabled={bulkAdding} onClick={handleBulkAdd}>
              <IconPlus className="h-3.5 w-3.5" /> Add Selected ({selectedIds.size})
            </Button>
          )}
        </div>

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

        {studentsLoading ? (
          <p className="mt-3 px-1 py-4 text-center text-sm text-navy-700/45">Loading students…</p>
        ) : filteredStudents.length === 0 ? (
          <p className="mt-3 px-1 py-4 text-center text-sm text-navy-700/45">
            {addableStudents.length === 0 ? 'Every student is already in this group.' : 'No matching students found.'}
          </p>
        ) : (
          <>
            <label className="mt-3 flex items-center gap-2.5 px-1 text-xs font-semibold text-navy-700/55">
              <Checkbox checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
              Select all {query.trim() ? 'matching' : ''} students ({filteredStudents.length})
            </label>
            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl ring-1 ring-navy-900/8">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-2.5 border-b border-navy-900/6 px-3.5 py-2.5 last:border-0">
                  <Checkbox checked={selectedIds.has(student.id)} onChange={() => toggleSelect(student.id)} />
                  <Avatar user={student} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900">{student.full_name}</p>
                    <p className="truncate text-xs text-navy-700/50">{student.email}</p>
                  </div>
                  <Button size="sm" variant="secondary" disabled={busyId === student.id} onClick={() => handleAdd(student.id)}>
                    {busyId === student.id ? 'Adding…' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {isAdmin && (
          <div className="mt-4 border-t border-navy-900/8 pt-4">
            {!showCreateForm ? (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="text-xs font-semibold text-brand-500 hover:text-navy-900"
              >
                Can't find who you're looking for? + Create a new student
              </button>
            ) : (
              <div className="space-y-3 rounded-xl bg-navy-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-navy-700/55">New Student</h3>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setCreateError('') }}
                    className="text-xs font-semibold text-navy-700/50 hover:text-navy-900"
                  >
                    Cancel
                  </button>
                </div>
                {createError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{createError}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="First name">
                    <Input value={newStudent.first_name} onChange={(e) => updateNewStudent('first_name', e.target.value)} />
                  </FormField>
                  <FormField label="Last name">
                    <Input value={newStudent.last_name} onChange={(e) => updateNewStudent('last_name', e.target.value)} />
                  </FormField>
                  <FormField label="Username" required>
                    <Input value={newStudent.username} onChange={(e) => updateNewStudent('username', e.target.value)} />
                  </FormField>
                  <FormField label="Email" required>
                    <Input type="email" value={newStudent.email} onChange={(e) => updateNewStudent('email', e.target.value)} />
                  </FormField>
                  <FormField label="Password" required className="sm:col-span-2">
                    <Input
                      type="password"
                      value={newStudent.password}
                      onChange={(e) => updateNewStudent('password', e.target.value)}
                      autoComplete="new-password"
                    />
                  </FormField>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" loading={creating} disabled={creating} onClick={handleCreateStudent}>
                    Create &amp; Add to Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <IconBook className="h-4 w-4 text-navy-700/40" /> Assigned Courses ({group?.courses?.length ?? 0})
        </h2>
        <p className="mt-1 text-xs text-navy-700/50">
          Members of this group can access every course assigned here, in addition to any course they're separately enrolled in.
        </p>
        <div className="relative mt-3">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700/35" />
          <input
            type="text"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
            placeholder="Search courses to assign…"
            className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {courseQuery.trim() && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl ring-1 ring-navy-900/8">
            {courseMatches.length === 0 ? (
              <p className="px-4 py-4 text-center text-sm text-navy-700/45">No matching courses found.</p>
            ) : (
              courseMatches.map((course) => (
                <div key={course.id} className="flex items-center gap-2.5 border-b border-navy-900/6 px-3.5 py-2.5 last:border-0">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy-900">{course.title}</p>
                  <Button size="sm" disabled={busyCourseId === course.id} onClick={() => handleAssignCourse(course.id)}>
                    <IconPlus className="h-3.5 w-3.5" /> Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {(group?.courses ?? []).length === 0 ? (
          <p className="mt-3 rounded-xl bg-navy-50 p-4 text-center text-sm text-navy-700/50">No courses assigned to this group yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {group.courses.map((course) => (
              <li key={course.id} className="flex items-center gap-2.5 rounded-xl bg-navy-50/60 px-3.5 py-2.5">
                <IconBook className="h-4 w-4 shrink-0 text-navy-700/40" />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy-900">{course.title}</p>
                <button
                  type="button"
                  disabled={busyCourseId === course.id}
                  onClick={() => handleRemoveCourse(course.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                  aria-label="Remove course from group"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
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
