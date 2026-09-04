import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import DataTable from '../../components/dashboard/DataTable'
import { IconClipboard } from '../../components/icons'

const CONTENT_MANAGER_ROLES = ['admin', 'academic_manager', 'instructor', 'content_manager']

const statusStyles = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-amber-50 text-amber-700',
  archived: 'bg-navy-100 text-navy-700',
  suspended: 'bg-red-50 text-red-700',
}

export default function CoursesList() {
  const { accessToken, user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const isInstructor = user?.user_type === 'instructor'

  useEffect(() => {
    let cancelled = false
    const path = isInstructor ? '/courses/my-courses/' : '/courses/?status=published'
    apiFetch(path, { token: accessToken })
      .then((data) => {
        if (cancelled) return
        setCourses(Array.isArray(data) ? data : data.results ?? [])
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken, isInstructor])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
            {isInstructor ? 'My Courses' : 'Courses'}
          </h1>
          <p className="mt-1 text-sm text-navy-700/55">{courses.length} course{courses.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <DataTable
        loading={loading}
        rows={courses}
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
              <Link
                to={`/dashboard/courses/${c.slug}/content`}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-navy-50"
              >
                <IconClipboard className="h-3.5 w-3.5" /> Manage Content
              </Link>
            ),
          }] : []),
        ]}
      />
    </div>
  )
}
