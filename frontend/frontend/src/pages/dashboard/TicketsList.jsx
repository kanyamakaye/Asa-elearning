import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listSupportTickets, updateSupportTicket } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'

const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const priorityStyles = {
  urgent: 'bg-red-50 text-red-700',
  high: 'bg-amber-50 text-amber-700',
  medium: 'bg-brand-50 text-brand-600',
  low: 'bg-navy-100 text-navy-700',
}

export default function TicketsList() {
  const { accessToken } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    listSupportTickets(accessToken)
      .then((data) => setTickets(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  async function handleStatusChange(ticket, status) {
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status } : t)))
    try {
      await updateSupportTicket(ticket.id, { status }, accessToken)
    } catch {
      load()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Support Tickets</h1>
        <p className="mt-1 text-sm text-navy-700/55">{tickets.length} ticket{tickets.length === 1 ? '' : 's'}</p>
      </div>

      <DataTable
        loading={loading}
        rows={tickets}
        columns={[
          { key: 'subject', label: 'Subject' },
          { key: 'user', label: 'User', render: (t) => t.user?.full_name ?? '—' },
          { key: 'category', label: 'Category', render: (t) => <span className="capitalize">{t.category}</span> },
          {
            key: 'priority',
            label: 'Priority',
            render: (t) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[t.priority] ?? ''}`}>
                {t.priority}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (t) => (
              <select
                value={t.status}
                onChange={(e) => handleStatusChange(t, e.target.value)}
                className="rounded-lg border border-navy-900/10 bg-white px-2 py-1 text-xs font-semibold capitalize focus:border-brand-400 focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            ),
          },
          { key: 'created_at', label: 'Created', render: (t) => new Date(t.created_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
