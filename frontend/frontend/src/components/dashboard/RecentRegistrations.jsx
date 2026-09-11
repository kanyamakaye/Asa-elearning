import { Link } from 'react-router-dom'
import DataTable from './DataTable'

const COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    render: (row) => `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.email,
  },
  { key: 'email', label: 'Email' },
  {
    key: 'user_type',
    label: 'Role',
    render: (row) => <span className="capitalize">{(row.user_type ?? '').replaceAll('_', ' ')}</span>,
  },
  {
    key: 'date_joined',
    label: 'Date',
    render: (row) => (row.date_joined ? new Date(row.date_joined).toLocaleDateString() : '—'),
  },
]

export default function RecentRegistrations({ items = [], loading }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900">Recent Registrations</h3>
        <Link to="/dashboard/users" className="text-xs font-semibold text-brand-500 hover:underline">
          View All
        </Link>
      </div>
      <div className="mt-4">
        <DataTable columns={COLUMNS} rows={items} loading={loading} rowKey="id" emptyMessage="No recent registrations." />
      </div>
    </div>
  )
}
