import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import ChartCard from '../../components/dashboard/ChartCard'
import DashboardHero from '../../components/dashboard/DashboardHero'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivity from '../../components/dashboard/RecentActivity'
import StatCard from '../../components/dashboard/StatCard'
import { IconAward, IconBook, IconClipboard, IconTrendingUp, IconUsers } from '../../components/icons'

export default function AcademicDashboard() {
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  function load(isRefresh) {
    if (isRefresh) setRefreshing(true)
    return getDashboard('academic_manager', accessToken)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setRefreshing(false))
  }

  useEffect(() => { load(false) }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = data?.statistics ?? {}

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={IconUsers}
        title="Academic Overview"
        subtitle="Monitor courses, instructors, students, and academic performance."
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={IconBook} label="Total Courses" value={stats.total_courses} />
        <StatCard icon={IconBook} label="Active Courses" value={stats.active_courses} accent="emerald" />
        <StatCard icon={IconUsers} label="Total Students" value={stats.total_students} accent="navy" />
        <StatCard icon={IconUsers} label="Active Instructors" value={stats.active_instructors} accent="navy" />
        <StatCard icon={IconClipboard} label="Active Enrollments" value={stats.active_enrollments} />
        <StatCard icon={IconTrendingUp} label="Completed Courses" value={stats.completed_courses} accent="emerald" />
        <StatCard icon={IconClipboard} label="Pending Assessments" value={stats.pending_assessments} accent="amber" />
        <StatCard icon={IconAward} label="Certificates Issued" value={stats.certificates_issued} accent="emerald" />
      </div>

      <ChartCard
        title="Enrollment Trend"
        subtitle="Last 6 months"
        data={(data?.charts?.enrollments ?? []).map((r) => ({
          label: new Date(r.month).toLocaleDateString(undefined, { month: 'short' }),
          new: r.new,
          completed: r.completed,
        }))}
        series={[
          { key: 'new', label: 'New', color: 'bg-brand-500' },
          { key: 'completed', label: 'Completed', color: 'bg-emerald-500' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={data?.recent_activity ?? []} />
        </div>
        <QuickActions
          actions={[
            { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
            { label: 'View Courses', to: '/dashboard/courses', icon: IconBook },
            { label: 'View Enrollments', to: '/dashboard/enrollments', icon: IconClipboard },
            { label: 'Certificates', to: '/dashboard/certificates', icon: IconAward },
          ]}
        />
      </div>
    </div>
  )
}
