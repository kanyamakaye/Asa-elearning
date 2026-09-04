import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listAuditLogs } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'

export default function AuditLogsList() {
  const { accessToken } = useAuth()
  const [logs, setLogs] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listAuditLogs(accessToken).then((data) => {
      if (cancelled) return
      setLogs(data.results ?? data)
      setCount(data.count ?? (data.results ?? data).length)
    }).catch(() => {}).finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [accessToken])

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" description={`${count} login event${count === 1 ? '' : 's'}`} />

      <DataTable
        loading={loading}
        rows={logs}
        emptyMessage="No login activity recorded yet."
        columns={[
          { key: 'user', label: 'User', render: (l) => l.user?.full_name ?? l.user?.username ?? 'Unknown' },
          { key: 'login_status', label: 'Status', render: (l) => <Badge tone={l.login_status === 'successful' ? 'success' : 'danger'}>{l.login_status}</Badge> },
          { key: 'ip_address', label: 'IP Address' },
          { key: 'device_information', label: 'Device' },
          { key: 'login_at', label: 'Login At', render: (l) => new Date(l.login_at).toLocaleString() },
        ]}
      />
    </div>
  )
}
