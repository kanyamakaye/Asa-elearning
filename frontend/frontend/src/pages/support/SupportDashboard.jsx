import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import DashboardHero from '../../components/dashboard/DashboardHero'
import DataTable from '../../components/dashboard/DataTable'
import StatCard from '../../components/dashboard/StatCard'
import { IconClock, IconLifeBuoy } from '../../components/icons'

const priorityStyles = {
  urgent: 'bg-red-50 text-red-700',
  high: 'bg-amber-50 text-amber-700',
  medium: 'bg-brand-50 text-brand-600',
  low: 'bg-navy-100 text-navy-700',
}

export default function SupportDashboard() {
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  function load(isRefresh) {
    if (isRefresh) setRefreshing(true)
    return getDashboard('support_staff', accessToken)
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
        icon={IconLifeBuoy}
        title="Support Overview"
        subtitle="Track and resolve user support requests."
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={IconLifeBuoy} label="Open Tickets" value={stats.open_tickets} accent="red" />
        <StatCard icon={IconLifeBuoy} label="In Progress" value={stats.in_progress} accent="amber" />
        <StatCard icon={IconLifeBuoy} label="High Priority" value={stats.high_priority} accent="red" />
        <StatCard icon={IconLifeBuoy} label="Resolved Today" value={stats.resolved_today} accent="emerald" />
        <StatCard
          icon={IconClock}
          label="Avg. Response Time"
          value={stats.average_response_time_hours != null ? `${stats.average_response_time_hours}h` : '—'}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Recent Tickets</h3>
          <Link to="/dashboard/tickets" className="text-xs font-semibold text-brand-500 hover:text-navy-900">
            View all &rarr;
          </Link>
        </div>
        <DataTable
          loading={loading}
          rows={data?.tickets ?? []}
          columns={[
            { key: 'subject', label: 'Subject' },
            { key: 'user', label: 'User', render: (r) => `${r.user__first_name ?? ''} ${r.user__last_name ?? ''}`.trim() },
            { key: 'category', label: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
            {
              key: 'priority',
              label: 'Priority',
              render: (r) => (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[r.priority] ?? ''}`}>
                  {r.priority}
                </span>
              ),
            },
            { key: 'status', label: 'Status', render: (r) => <span className="capitalize">{r.status.replace('_', ' ')}</span> },
          ]}
        />
      </div>
    </div>
  )
}
