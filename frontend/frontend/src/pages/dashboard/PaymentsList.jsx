import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listPayments } from '../../lib/dashboardApi'
import DataTable from '../../components/dashboard/DataTable'

const statusStyles = {
  successful: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  cancelled: 'bg-navy-100 text-navy-700',
  refunded: 'bg-brand-50 text-brand-600',
}

export default function PaymentsList() {
  const { accessToken } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listPayments(accessToken)
      .then((data) => !cancelled && setPayments(data.results ?? data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const total = payments
    .filter((p) => p.payment_status === 'successful')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Transactions</h1>
        <p className="mt-1 text-sm text-navy-700/55">
          {payments.length} transactions &middot; ${total.toFixed(2)} collected
        </p>
      </div>

      <DataTable
        loading={loading}
        rows={payments}
        columns={[
          { key: 'transaction_reference', label: 'Reference' },
          { key: 'course', label: 'Course', render: (p) => p.course_detail?.title ?? '—' },
          { key: 'amount', label: 'Amount', render: (p) => `${p.currency} ${p.amount}` },
          { key: 'payment_method', label: 'Method' },
          {
            key: 'payment_status',
            label: 'Status',
            render: (p) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[p.payment_status] ?? ''}`}>
                {p.payment_status}
              </span>
            ),
          },
          { key: 'created_at', label: 'Date', render: (p) => new Date(p.created_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
