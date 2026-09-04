import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import DataTable from '../../components/dashboard/DataTable'

export default function Grades() {
  const { accessToken } = useAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch('/assessments/grades/', { token: accessToken })
      .then((data) => !cancelled && setGrades(data.results ?? data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const avg = grades.length
    ? Math.round(grades.reduce((sum, g) => sum + Number(g.percentage), 0) / grades.length)
    : null

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">My Grades</h1>
        <p className="mt-1 text-sm text-navy-700/55">
          {grades.length} graded assessment{grades.length === 1 ? '' : 's'}
          {avg != null && ` · ${avg}% average`}
        </p>
      </div>

      <DataTable
        loading={loading}
        rows={grades}
        rowKey="graded_at"
        columns={[
          { key: 'course', label: 'Course', render: (g) => g.course_title ?? '—' },
          { key: 'assessment_type', label: 'Assessment', render: (g) => <span className="capitalize">{g.assessment_type}</span> },
          { key: 'marks', label: 'Marks', render: (g) => `${g.marks_obtained}/${g.maximum_marks}` },
          { key: 'percentage', label: '%', render: (g) => `${g.percentage}%` },
          {
            key: 'letter_grade',
            label: 'Grade',
            render: (g) => <span className="font-bold text-navy-900">{g.letter_grade}</span>,
          },
          { key: 'graded_at', label: 'Date', render: (g) => new Date(g.graded_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
