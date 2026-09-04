import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import ChartCard from '../../components/dashboard/ChartCard'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivity from '../../components/dashboard/RecentActivity'
import StatCard from '../../components/dashboard/StatCard'
import {
  IconAward,
  IconBook,
  IconCreditCard,
  IconLifeBuoy,
  IconPlus,
  IconTrendingUp,
  IconUsers,
} from '../../components/icons'

export default function AdminDashboard() {
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDashboard('admin', accessToken)
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const stats = data?.statistics ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
          Welcome back{data?.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-navy-700/55">Here's what's happening across Asa Academy.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={IconUsers} label="Total Users" value={stats.total_users} hint={`${stats.active_users ?? 0} active`} />
        <StatCard icon={IconUsers} label="Students" value={stats.total_students} accent="navy" />
        <StatCard icon={IconUsers} label="Instructors" value={stats.total_instructors} accent="navy" />
        <StatCard icon={IconBook} label="Courses" value={stats.total_courses} hint={`${stats.published_courses ?? 0} published`} />
        <StatCard icon={IconTrendingUp} label="Active Enrollments" value={stats.active_enrollments} accent="emerald" />
        <StatCard icon={IconAward} label="Certificates Issued" value={stats.certificates_issued} accent="emerald" />
        <StatCard icon={IconCreditCard} label="Total Revenue" value={`$${stats.total_revenue ?? 0}`} accent="amber" />
        <StatCard icon={IconCreditCard} label="Pending Payments" value={stats.pending_payments} accent="amber" />
        <StatCard icon={IconLifeBuoy} label="Open Support Tickets" value={stats.open_support_tickets} accent="red" />
        <StatCard icon={IconBook} label="Draft Courses" value={stats.draft_courses} accent="navy" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="User Registrations"
          subtitle="Last 14 days"
          data={(data?.charts?.user_registrations ?? []).map((r) => ({
            label: new Date(r.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            students: r.students,
            instructors: r.instructors,
          }))}
          series={[
            { key: 'students', label: 'Students', color: 'bg-brand-500' },
            { key: 'instructors', label: 'Instructors', color: 'bg-navy-700' },
          ]}
        />
        <ChartCard
          title="Enrollment Trend"
          subtitle="Last 6 months"
          data={(data?.charts?.enrollments ?? []).map((r) => ({
            label: new Date(r.month).toLocaleDateString(undefined, { month: 'short' }),
            new: r.new,
            completed: r.completed,
            cancelled: r.cancelled,
          }))}
          series={[
            { key: 'new', label: 'New', color: 'bg-brand-500' },
            { key: 'completed', label: 'Completed', color: 'bg-emerald-500' },
            { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400' },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={data?.recent_activity ?? []} />
        </div>
        <div className="space-y-6">
          <QuickActions
            actions={[
              { label: 'Add User', to: '/dashboard/users', icon: IconPlus },
              { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
              { label: 'Add Category', to: '/dashboard/categories', icon: IconPlus },
              { label: 'View Reports', to: '/dashboard', icon: IconTrendingUp },
              { label: 'Manage Payments', to: '/dashboard/payments', icon: IconCreditCard },
              { label: 'Support Tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
            ]}
          />

          <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
            <h3 className="text-sm font-bold text-navy-900">Top Courses</h3>
            <ul className="mt-3 space-y-3">
              {(data?.top_courses ?? []).length === 0 && !loading && (
                <p className="text-sm text-navy-700/45">No courses yet.</p>
              )}
              {(data?.top_courses ?? []).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-3 text-navy-800">{c.title}</span>
                  <span className="shrink-0 font-semibold text-navy-900">{c.enrollment_count} enrolled</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
