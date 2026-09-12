import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import ChartCard from '../../components/dashboard/ChartCard'
import DashboardFilterBar from '../../components/dashboard/DashboardFilterBar'
import DashboardHero from '../../components/dashboard/DashboardHero'
import DonutChartCard from '../../components/dashboard/DonutChartCard'
import ExecutiveKpis from '../../components/dashboard/ExecutiveKpis'
import LineChartCard from '../../components/dashboard/LineChartCard'
import PortfolioSummary from '../../components/dashboard/PortfolioSummary'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivity from '../../components/dashboard/RecentActivity'
import RecentRegistrations from '../../components/dashboard/RecentRegistrations'
import StatCard from '../../components/dashboard/StatCard'
import SystemOverview from '../../components/dashboard/SystemOverview'
import UpcomingLiveClasses from '../../components/dashboard/UpcomingLiveClasses'
import {
  IconAward,
  IconBook,
  IconCreditCard,
  IconLifeBuoy,
  IconPlus,
  IconShield,
  IconTrendingUp,
  IconUsers,
} from '../../components/icons'

const EMPTY_FILTERS = { category: '', level: '', instructor: '', date_from: '', date_to: '' }

export default function AdminDashboard() {
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  function load(isRefresh) {
    if (isRefresh) setRefreshing(true)
    return getDashboard('admin', accessToken, filters)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => { load(false) }, [accessToken, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = data?.statistics ?? {}

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={IconShield}
        title={`Welcome back${data?.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}`}
        subtitle="Here's what's happening across Asa Academy."
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <DashboardFilterBar options={data?.filter_options} value={filters} onChange={setFilters} />

      <PortfolioSummary data={data?.portfolio_summary} />

      <ExecutiveKpis data={data?.executive_kpis} />

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChartCard
            title="User Growth"
            subtitle="Last 12 months"
            data={(data?.charts?.user_growth ?? []).map((r) => ({
              label: new Date(r.month).toLocaleDateString(undefined, { month: 'short' }),
              students: r.students,
              instructors: r.instructors,
              total_users: r.total_users,
            }))}
            series={[
              { key: 'students', label: 'Students', color: '#2f5fff' },
              { key: 'instructors', label: 'Instructors', color: '#059669' },
              { key: 'total_users', label: 'Total Users', color: '#7c3aed' },
            ]}
          />
        </div>
        <DonutChartCard
          title="Course Categories"
          centerLabel="Courses"
          linkTo="/dashboard/categories"
          data={data?.charts?.course_categories ?? []}
          valueKey="course_count"
          labelKey="name"
        />
      </div>

      <ChartCard
        title="Enrollments vs Completions"
        subtitle="Last 12 months"
        data={(data?.charts?.enrollments ?? []).map((r) => ({
          label: new Date(r.month).toLocaleDateString(undefined, { month: 'short' }),
          new: r.new,
          completed: r.completed,
        }))}
        series={[
          { key: 'new', label: 'Enrollments', color: 'bg-brand-500' },
          { key: 'completed', label: 'Completions', color: 'bg-emerald-500' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentActivity items={data?.recent_activity ?? []} />
          <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
            <h3 className="text-sm font-bold text-navy-900">Top Performing Courses</h3>
            <ul className="mt-3 space-y-3">
              {(data?.top_courses ?? []).length === 0 && !loading && (
                <p className="text-sm text-navy-700/45">No courses yet.</p>
              )}
              {(data?.top_courses ?? []).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-3 text-navy-800">{c.title}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    {c.avg_rating != null && (
                      <span className="text-xs font-semibold text-amber-600">★ {Number(c.avg_rating).toFixed(1)}</span>
                    )}
                    <span className="font-semibold text-navy-900">{c.enrollment_count} enrolled</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <UpcomingLiveClasses items={data?.upcoming_live_classes ?? []} />
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRegistrations items={data?.recent_registrations ?? []} loading={loading} />
        <SystemOverview system={data?.system} />
      </div>
    </div>
  )
}
