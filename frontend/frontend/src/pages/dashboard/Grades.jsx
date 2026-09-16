import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import DataTable from '../../components/dashboard/DataTable'

export default function Grades() {
  const { accessToken } = useAuth()
  const [grades, setGrades] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [assessmentType, setAssessmentType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { setPage(1) }, [assessmentType, search])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ page })
    if (assessmentType) params.set('assessment_type', assessmentType)
    if (search.trim()) params.set('search', search.trim())
    const timer = setTimeout(() => {
      setLoading(true)
      apiFetch(`/assessments/grades/?${params}`, { token: accessToken })
        .then((data) => {
          if (cancelled) return
          setGrades(data.results ?? data)
          setCount(data.count ?? (data.results ?? data).length)
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false))
    }, search ? 300 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [accessToken, page, assessmentType, search])

  const avg = grades.length
    ? Math.round(grades.reduce((sum, g) => sum + Number(g.percentage), 0) / grades.length)
    : null

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">My Grades</h1>
        <p className="mt-1 text-sm text-navy-700/55">
          {count} graded assessment{count === 1 ? '' : 's'}
          {avg != null && ` · ${avg}% average`}
        </p>
      </div>

      <DataTable
        loading={loading}
        rows={grades}
        page={page}
        total={count}
        onPageChange={setPage}
        rowKey="graded_at"
        search={{ value: search, onChange: setSearch, placeholder: 'Search by course…' }}
        filters={[
          {
            label: 'Assessment',
            value: assessmentType,
            onChange: setAssessmentType,
            options: [
              { value: '', label: 'All types' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'assignment', label: 'Assignment' },
              { value: 'exam', label: 'Exam' },
              { value: 'project', label: 'Project' },
              { value: 'participation', label: 'Participation' },
            ],
          },
        ]}
        exportFilename="grades"
        exportTitle="My Grades"
        columns={[
          { key: 'course', label: 'Course', render: (g) => g.course_title ?? '—', exportValue: (g) => g.course_title ?? '' },
          { key: 'assessment_type', label: 'Assessment', render: (g) => <span className="capitalize">{g.assessment_type}</span>, exportValue: (g) => g.assessment_type },
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
