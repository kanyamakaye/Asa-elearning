import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listUsers } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'
import { ROLE_LABELS } from '../../components/dashboard/navConfig'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-navy-100 text-navy-700',
  suspended: 'bg-amber-50 text-amber-700',
  blocked: 'bg-red-50 text-red-700',
}

export default function UsersList() {
  const { accessToken } = useAuth()
  const [params] = useSearchParams()
  const role = params.get('role')
  const [users, setUsers] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listUsers(accessToken, role ? { role } : {})
      .then((data) => {
        if (cancelled) return
        setUsers(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken, role])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
          {role ? (role.includes(',') ? 'Staff' : `${ROLE_LABELS[role] ?? role}s`) : 'All Users'}
        </h1>
        <p className="mt-1 text-sm text-navy-700/55">{count} user{count === 1 ? '' : 's'}</p>
      </div>

      <DataTable
        loading={loading}
        rows={users}
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          {
            key: 'user_type',
            label: 'Role',
            render: (u) => ROLE_LABELS[u.user_type] ?? u.user_type,
          },
          {
            key: 'status',
            label: 'Status',
            render: (u) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[u.status] ?? ''}`}>
                {u.status}
              </span>
            ),
          },
          {
            key: 'date_joined',
            label: 'Joined',
            render: (u) => new Date(u.date_joined).toLocaleDateString(),
          },
        ]}
      />
    </div>
  )
}
