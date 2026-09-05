import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { deleteCourse } from '../../services/courseService'
import DataTable from '../../components/dashboard/DataTable'
import { IconClipboard, IconEdit, IconTrash } from '../../components/icons'

const CONTENT_MANAGER_ROLES = ['admin', 'academic_manager', 'instructor', 'content_manager']
// Matches CanManageCourse.WRITE_ROLES on the backend — content managers can
// edit a course's modules/lessons but not the course record itself.
const COURSE_MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']

const statusStyles = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-amber-50 text-amber-700',
  archived: 'bg-navy-100 text-navy-700',
  suspended: 'bg-red-50 text-red-700',
}

const PAGE_SIZE = 20

export default function CoursesList() {
  const { accessToken, user } = useAuth()
  const [allCourses, setAllCourses] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busySlug, setBusySlug] = useState(null)
  const isInstructor = user?.user_type === 'instructor'

  async function load() {
    setLoading(true)
    try {
      const path = isInstructor ? '/courses/my-courses/' : '/courses/?status=published&page_size=200'
      const data = await apiFetch(path, { token: accessToken })
      setAllCourses(Array.isArray(data) ? data : data.results ?? [])
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1); load() }, [accessToken, isInstructor]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(course) {
    if (!window.confirm(`Delete course "${course.title}"? This cannot be undone.`)) return
    setBusySlug(course.slug)
    try {
      await deleteCourse(course.slug)
      await load()
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusySlug(null)
    }
  }

  const courses = allCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
            {isInstructor ? 'My Courses' : 'Courses'}
          </h1>
          <p className="mt-1 text-sm text-navy-700/55">{allCourses.length} course{allCourses.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <DataTable
        loading={loading}
        rows={courses}
        page={page}
        total={allCourses.length}
        onPageChange={setPage}
        columns={[
          { key: 'title', label: 'Title', render: (c) => <Link to={`/courses/${c.slug}`} className="font-semibold text-navy-900 hover:text-brand-500">{c.title}</Link> },
          { key: 'course_code', label: 'Code' },
          { key: 'category', label: 'Category', render: (c) => c.category?.name ?? '—' },
          { key: 'instructor', label: 'Instructor', render: (c) => c.instructor?.full_name ?? '—' },
          {
            key: 'status',
            label: 'Status',
            render: (c) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[c.status] ?? ''}`}>
                {c.status}
              </span>
            ),
          },
          { key: 'enrolled_count', label: 'Students' },
          { key: 'price', label: 'Price', render: (c) => (c.is_free ? 'Free' : `$${c.price}`) },
          ...(CONTENT_MANAGER_ROLES.includes(user?.user_type) ? [{
            key: 'actions',
            label: '',
            render: (c) => (
              <div className="flex items-center justify-end gap-2">
                <Link
                  to={`/dashboard/courses/${c.slug}/content`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-navy-50"
                >
                  <IconClipboard className="h-3.5 w-3.5" /> Manage Content
                </Link>
                {COURSE_MANAGER_ROLES.includes(user?.user_type) && (
                  <>
                    <Link
                      to={`/dashboard/courses/${c.slug}/edit`}
                      className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50"
                      aria-label="Edit course"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={busySlug === c.slug}
                      onClick={() => handleDelete(c)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                      aria-label="Delete course"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ),
          }] : []),
        ]}
      />
    </div>
  )
}
