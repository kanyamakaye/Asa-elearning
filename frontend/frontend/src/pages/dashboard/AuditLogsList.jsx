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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { setPage(1) }, [status, search])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      setLoading(true)
      listAuditLogs(accessToken, { page, ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) }).then((data) => {
        if (cancelled) return
        setLogs(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
      }).catch(() => {}).finally(() => !cancelled && setLoading(false))
    }, search ? 300 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [accessToken, page, status, search])

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" description={`${count} login event${count === 1 ? '' : 's'}`} />

      <DataTable
        loading={loading}
        rows={logs}
        page={page}
        total={count}
        onPageChange={setPage}
        emptyMessage="No login activity recorded yet."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by user, IP, or device…' }}
        filters={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: 'All statuses' },
              { value: 'successful', label: 'Successful' },
              { value: 'failed', label: 'Failed' },
            ],
          },
        ]}
        exportFilename="audit-logs"
        exportTitle="Login Audit Log"
        columns={[
          { key: 'user', label: 'User', render: (l) => l.user?.full_name ?? l.user?.username ?? 'Unknown', exportValue: (l) => l.user?.full_name ?? l.user?.username ?? 'Unknown' },
          {
            key: 'login_status', label: 'Status',
            render: (l) => <Badge tone={l.login_status === 'successful' ? 'success' : 'danger'}>{l.login_status}</Badge>,
            exportValue: (l) => l.login_status,
          },
          { key: 'ip_address', label: 'IP Address' },
          { key: 'device_information', label: 'Device' },
          { key: 'login_at', label: 'Login At', render: (l) => new Date(l.login_at).toLocaleString() },
        ]}
      />
    </div>
  )
}
