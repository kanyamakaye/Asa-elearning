import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import DashboardHero from '../../components/dashboard/DashboardHero'
import DataTable from '../../components/dashboard/DataTable'
import QuickActions from '../../components/dashboard/QuickActions'
import StatCard from '../../components/dashboard/StatCard'
import { IconBook, IconClipboard, IconFileText, IconPlus } from '../../components/icons'

export default function ContentDashboard() {
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  function load(isRefresh) {
    if (isRefresh) setRefreshing(true)
    return getDashboard('content_manager', accessToken)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => { load(false) }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = data?.statistics ?? {}

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={IconClipboard}
        title="Content Overview"
        subtitle="Manage courses, lessons, and learning resources."
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={IconBook} label="Total Courses" value={stats.total_courses} />
        <StatCard icon={IconBook} label="Published" value={stats.published_courses} accent="emerald" />
        <StatCard icon={IconBook} label="Drafts" value={stats.draft_courses} accent="amber" />
        <StatCard icon={IconClipboard} label="Modules" value={stats.total_modules} accent="navy" />
        <StatCard icon={IconFileText} label="Lessons" value={stats.total_lessons} accent="navy" />
        <StatCard icon={IconFileText} label="Learning Resources" value={stats.learning_resources} accent="navy" />
      </div>

      <QuickActions
        actions={[
          { label: 'Add Category', to: '/dashboard/categories', icon: IconPlus },
          { label: 'View Courses', to: '/dashboard/courses', icon: IconBook },
        ]}
      />

      <div>
        <h3 className="mb-3 text-sm font-bold text-navy-900">Recently Updated Courses</h3>
        <DataTable
          loading={loading}
          rows={data?.recent_courses ?? []}
          columns={[
            { key: 'title', label: 'Course' },
            {
              key: 'instructor',
              label: 'Instructor',
              render: (r) => `${r.instructor__first_name ?? ''} ${r.instructor__last_name ?? ''}`.trim() || '—',
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => <span className="capitalize">{r.status}</span>,
            },
            {
              key: 'updated_at',
              label: 'Updated',
              render: (r) => new Date(r.updated_at).toLocaleDateString(),
            },
          ]}
        />
      </div>
    </div>
  )
}
