import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listRefunds, processRefund } from '../../lib/dashboardApi'
import { formatCurrency } from '../../lib/currency'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'

const statusTone = { pending: 'warning', approved: 'brand', rejected: 'danger', completed: 'success' }

export default function RefundsList() {
  const { accessToken } = useAuth()
  const [refunds, setRefunds] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await listRefunds(accessToken, { page })
      setRefunds(data.results ?? data)
      setCount(data.count ?? (data.results ?? data).length)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accessToken, page]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleProcess(id, status) {
    setBusyId(id)
    try {
      await processRefund(id, status, accessToken)
      await load()
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Refunds" description={`${count} refund request${count === 1 ? '' : 's'}`} />

      <DataTable
        loading={loading}
        rows={refunds}
        page={page}
        total={count}
        onPageChange={setPage}
        emptyMessage="No refund requests."
        columns={[
          { key: 'id', label: 'Ref', render: (r) => `#${r.id}` },
          { key: 'student', label: 'Student', render: (r) => r.student?.full_name ?? r.student ?? '—' },
          { key: 'refund_amount', label: 'Amount', render: (r) => formatCurrency(r.refund_amount) },
          { key: 'refund_reason', label: 'Reason', render: (r) => <span className="max-w-xs truncate">{r.refund_reason || '—'}</span> },
          { key: 'refund_status', label: 'Status', render: (r) => <Badge tone={statusTone[r.refund_status]}>{r.refund_status}</Badge> },
          {
            key: 'actions',
            label: '',
            render: (r) => r.refund_status === 'pending' ? (
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => handleProcess(r.id, 'approved')}>Approve</Button>
                <Button size="sm" variant="danger" disabled={busyId === r.id} onClick={() => handleProcess(r.id, 'rejected')}>Reject</Button>
              </div>
            ) : r.refund_status === 'approved' ? (
              <Button size="sm" disabled={busyId === r.id} onClick={() => handleProcess(r.id, 'completed')}>Mark Completed</Button>
            ) : null,
          },
        ]}
      />
    </div>
  )
}
