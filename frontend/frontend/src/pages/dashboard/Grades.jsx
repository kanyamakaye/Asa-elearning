import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { apiFetch } from '../../lib/api'
import DataTable from '../../components/dashboard/DataTable'

export default function Grades() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
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
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('dashboardStudent.grades.heading')}</h1>
        <p className="mt-1 text-sm text-navy-700/55 dark:text-navy-100/55">
          {t('dashboardStudent.grades.gradedCount', { count })}
          {avg != null && ` · ${t('dashboardStudent.grades.average', { avg })}`}
        </p>
      </div>

      <DataTable
        loading={loading}
        rows={grades}
        page={page}
        total={count}
        onPageChange={setPage}
        rowKey="graded_at"
        search={{ value: search, onChange: setSearch, placeholder: t('dashboardStudent.grades.searchPlaceholder') }}
        filters={[
          {
            label: t('dashboardStudent.grades.filterAssessment'),
            value: assessmentType,
            onChange: setAssessmentType,
            options: [
              { value: '', label: t('dashboardStudent.grades.allTypes') },
              { value: 'quiz', label: t('dashboardStudent.grades.typeQuiz') },
              { value: 'assignment', label: t('dashboardStudent.grades.typeAssignment') },
              { value: 'exam', label: t('dashboardStudent.grades.typeExam') },
              { value: 'project', label: t('dashboardStudent.grades.typeProject') },
              { value: 'participation', label: t('dashboardStudent.grades.typeParticipation') },
            ],
          },
        ]}
        exportFilename="grades"
        exportTitle={t('dashboardStudent.grades.exportTitle')}
        columns={[
          { key: 'course', label: t('dashboardStudent.grades.columnCourse'), render: (g) => g.course_title ?? '—', exportValue: (g) => g.course_title ?? '' },
          { key: 'assessment_type', label: t('dashboardStudent.grades.columnAssessment'), render: (g) => <span className="capitalize">{g.assessment_type}</span>, exportValue: (g) => g.assessment_type },
          { key: 'marks', label: t('dashboardStudent.grades.columnMarks'), render: (g) => `${g.marks_obtained}/${g.maximum_marks}` },
          { key: 'percentage', label: '%', render: (g) => `${g.percentage}%` },
          {
            key: 'letter_grade',
            label: t('dashboardStudent.grades.columnGrade'),
            render: (g) => <span className="font-bold text-navy-900 dark:text-white">{g.letter_grade}</span>,
          },
          { key: 'graded_at', label: t('dashboardStudent.grades.columnDate'), render: (g) => new Date(g.graded_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
