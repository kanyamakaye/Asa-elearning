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
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    listSupportTickets(accessToken, { page, ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) })
      .then((data) => {
        setTickets(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { setPage(1) }, [status, search])
  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, page, status, search])

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
        <p className="mt-1 text-sm text-navy-700/55">{count} ticket{count === 1 ? '' : 's'}</p>
      </div>

      <DataTable
        loading={loading}
        rows={tickets}
        page={page}
        total={count}
        onPageChange={setPage}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by subject or description…' }}
        filters={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))],
          },
        ]}
        exportFilename="support-tickets"
        exportTitle="Support Tickets"
        columns={[
          { key: 'subject', label: 'Subject' },
          { key: 'user', label: 'User', render: (t) => t.user?.full_name ?? '—', exportValue: (t) => t.user?.full_name ?? '' },
          { key: 'category', label: 'Category', render: (t) => <span className="capitalize">{t.category}</span>, exportValue: (t) => t.category },
          {
            key: 'priority',
            label: 'Priority',
            render: (t) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[t.priority] ?? ''}`}>
                {t.priority}
              </span>
            ),
            exportValue: (t) => t.priority,
          },
          {
            key: 'status',
            label: 'Status',
            exportValue: (t) => t.status,
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
