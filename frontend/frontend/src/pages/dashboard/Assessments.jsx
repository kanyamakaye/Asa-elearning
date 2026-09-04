import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import AssessmentTable from '../../components/dashboard/AssessmentTable'

export default function Assessments() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDashboard('student', accessToken)
      .then((d) => !cancelled && setItems(d.upcoming_assessments ?? []))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Assessments</h1>
        <p className="mt-1 text-sm text-navy-700/55">Quizzes, assignments, and exams across your enrolled courses.</p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
      ) : (
        <AssessmentTable items={items} emptyMessage="You're all caught up — no pending assessments." />
      )}
    </div>
  )
}
