import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listEnrollments } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-brand-50 text-brand-600',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  suspended: 'bg-navy-100 text-navy-700',
}

export default function EnrollmentsList() {
  const { accessToken } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listEnrollments(accessToken, { page })
      .then((data) => {
        if (cancelled) return
        setEnrollments(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken, page])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Enrollments</h1>
        <p className="mt-1 text-sm text-navy-700/55">{count} enrollment{count === 1 ? '' : 's'}</p>
      </div>

      <DataTable
        loading={loading}
        rows={enrollments}
        page={page}
        total={count}
        onPageChange={setPage}
        columns={[
          { key: 'student', label: 'Student', render: (e) => e.student?.full_name ?? '—' },
          { key: 'course', label: 'Course', render: (e) => e.course_detail?.title ?? '—' },
          {
            key: 'status',
            label: 'Status',
            render: (e) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[e.status] ?? ''}`}>
                {e.status}
              </span>
            ),
          },
          { key: 'completion_percentage', label: 'Progress', render: (e) => `${Math.round(e.completion_percentage)}%` },
          { key: 'certificate_issued', label: 'Certificate', render: (e) => (e.certificate_issued ? 'Issued' : '—') },
          { key: 'created_at', label: 'Enrolled', render: (e) => new Date(e.created_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
