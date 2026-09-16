import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listPayments } from '../../lib/dashboardApi'
import { formatCurrency } from '../../lib/currency'
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
      listPayments(accessToken, { page, ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) })
        .then((data) => {
          if (cancelled) return
          setPayments(data.results ?? data)
          setCount(data.count ?? (data.results ?? data).length)
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false))
    }, search ? 300 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [accessToken, page, status, search])

  const total = payments
    .filter((p) => p.payment_status === 'successful')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Transactions</h1>
        <p className="mt-1 text-sm text-navy-700/55">
          {count} transactions &middot; {formatCurrency(total)} collected
        </p>
      </div>

      <DataTable
        loading={loading}
        rows={payments}
        page={page}
        total={count}
        onPageChange={setPage}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by reference, student, or course…' }}
        filters={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: 'All statuses' },
              { value: 'successful', label: 'Successful' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'refunded', label: 'Refunded' },
            ],
          },
        ]}
        exportFilename="payments"
        exportTitle="Payments"
        columns={[
          { key: 'transaction_reference', label: 'Reference' },
          { key: 'course', label: 'Course', render: (p) => p.course_detail?.title ?? '—', exportValue: (p) => p.course_detail?.title ?? '' },
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
            exportValue: (p) => p.payment_status,
          },
          { key: 'created_at', label: 'Date', render: (p) => new Date(p.created_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
