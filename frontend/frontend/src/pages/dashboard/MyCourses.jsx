import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listEnrollments } from '../../lib/dashboardApi'
import { IconArrowRight, IconAward, IconBook, IconSearch } from '../../components/icons'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-brand-50 text-brand-600',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  suspended: 'bg-navy-100 text-navy-700',
}

export default function MyCourses() {
  const { accessToken } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listEnrollments(accessToken)
      .then((data) => !cancelled && setEnrollments(data.results ?? data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">My Courses</h1>
          <p className="mt-1 text-sm text-navy-700/55">{enrollments.length} enrolled course{enrollments.length === 1 ? '' : 's'}</p>
        </div>
        <Link
          to="/dashboard/browse-courses"
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-500"
        >
          <IconSearch className="h-3.5 w-3.5" />
          Browse Courses
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8">
          You haven't enrolled in any courses yet. <Link to="/dashboard/browse-courses" className="font-semibold text-brand-500">Browse the catalog</Link>.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <div key={e.id} className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-navy-900/8">
              <div className="relative h-28 bg-navy-900">
                {e.course_detail?.image ? (
                  <img src={e.course_detail.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <IconBook className="h-8 w-8 text-white/15" />
                  </div>
                )}
                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[e.status] ?? ''}`}>
                  {e.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h4 className="text-sm font-bold text-navy-900">{e.course_detail?.title}</h4>
                <p className="mt-0.5 text-xs text-navy-700/50">{e.course_detail?.instructor?.full_name}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-medium text-navy-700/60">
                    <span>Progress</span>
                    <span>{Math.round(e.completion_percentage)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-navy-900/8">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                      style={{ width: `${e.completion_percentage}%` }}
                    />
                  </div>
                </div>
                <Link
                  to={`/learn/${e.course_detail?.slug}`}
                  className="mt-4 rounded-full bg-navy-900 py-2 text-center text-xs font-semibold text-white hover:bg-brand-500"
                >
                  {e.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                </Link>
                {e.certificate_issued && (
                  <Link
                    to="/dashboard/certificates"
                    className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-center text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
                  >
                    <IconAward className="h-3.5 w-3.5" />
                    Certificate earned — Download
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
