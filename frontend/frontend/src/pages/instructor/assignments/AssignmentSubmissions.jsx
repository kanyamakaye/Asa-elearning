import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { getAssignment, getSubmissions, gradeSubmission } from '../../../services/assignmentService'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import Textarea from '../../../components/ui/Textarea'

const statusTone = { submitted: 'neutral', late: 'warning', graded: 'success', returned: 'brand', draft: 'neutral' }

function GradeRow({ submission, maxMarks, rubric, onGraded }) {
  const { t } = useLanguage()
  const [marks, setMarks] = useState(submission.marks_awarded ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [rubricScores, setRubricScores] = useState(submission.rubric_scores ?? {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateCriterionScore(criterionId, points, maxPoints) {
    const clamped = Math.max(0, Math.min(Number(points) || 0, maxPoints))
    const next = { ...rubricScores, [criterionId]: clamped }
    setRubricScores(next)
    setMarks(Object.values(next).reduce((sum, v) => sum + (Number(v) || 0), 0))
  }

  async function submit() {
    if (marks === '' || Number(marks) < 0 || Number(marks) > maxMarks) {
      setError(t('dashboardInstructor.assignmentSubmissions.scoreRangeError', { max: maxMarks }))
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await gradeSubmission(submission.id, { marks_awarded: marks, feedback, rubric_scores: rubricScores })
      onGraded(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-navy-900 dark:text-white">{submission.student?.full_name ?? submission.student?.username}</p>
          <p className="text-xs text-navy-700/45 dark:text-navy-100/45">{t('dashboardInstructor.assignmentSubmissions.submittedAt', { date: new Date(submission.submitted_at).toLocaleString() })}</p>
        </div>
        <Badge tone={statusTone[submission.status]}>{submission.status}</Badge>
      </div>

      {submission.submission_text && (
        <p className="mt-3 rounded-xl bg-navy-50/60 p-3 text-sm text-navy-800 dark:bg-white/5 dark:text-navy-100">{submission.submission_text}</p>
      )}
      {submission.file && (
        <a href={submission.file} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
          {t('dashboardInstructor.assignmentSubmissions.viewSubmittedFile')}
        </a>
      )}

      {error && <Alert tone="error" className="mt-3">{error}</Alert>}

      {rubric && (
        <div className="mt-4 space-y-2 rounded-xl bg-navy-50/60 p-3.5 dark:bg-white/5">
          <p className="text-xs font-semibold text-navy-700/60 dark:text-navy-100/60">{t('dashboardInstructor.assignmentSubmissions.rubricScoreEach', { title: rubric.title })}</p>
          {rubric.criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm text-navy-800 dark:text-navy-100">{c.title}</span>
              <Input
                type="number" min="0" max={c.max_points} className="w-20"
                value={rubricScores[c.id] ?? ''}
                onChange={(e) => updateCriterionScore(c.id, e.target.value, c.max_points)}
              />
              <span className="w-12 shrink-0 text-xs text-navy-700/45 dark:text-navy-100/45">/ {c.max_points}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
        <div>
          <span className="text-xs font-semibold text-navy-700/60 dark:text-navy-100/60">{t('dashboardInstructor.assignmentSubmissions.scoreOutOf', { max: maxMarks })}</span>
          <Input type="number" min="0" max={maxMarks} className="mt-1.5" value={marks} onChange={(e) => setMarks(e.target.value)} disabled={!!rubric} />
        </div>
        <div>
          <span className="text-xs font-semibold text-navy-700/60 dark:text-navy-100/60">{t('dashboardInstructor.assignmentSubmissions.feedback')}</span>
          <Textarea rows={1} className="mt-1.5" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>
        <Button size="sm" loading={saving} disabled={saving} onClick={submit}>
          {saving ? t('dashboardInstructor.assignmentSubmissions.saving') : submission.status === 'graded' ? t('dashboardInstructor.assignmentSubmissions.updateGrade') : t('dashboardInstructor.assignmentSubmissions.grade')}
        </Button>
      </div>
    </div>
  )
}

export default function AssignmentSubmissions() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getAssignment(id), getSubmissions(id)]).then(([a, subs]) => {
      if (cancelled) return
      setAssignment(a)
      setSubmissions(subs)
    }).catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id])

  function handleGraded(updated) {
    setSubmissions((subs) => subs.map((s) => (s.id === updated.id ? updated : s)))
  }

  if (loading) return <LoadingSpinner label={t('dashboardInstructor.assignmentSubmissions.loading')} />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: t('dashboardInstructor.assignmentSubmissions.breadcrumbDashboard'), to: '/dashboard' }, { label: t('dashboardInstructor.assignmentSubmissions.breadcrumbAssignments'), to: '/dashboard/assignments' }, { label: t('dashboardInstructor.assignmentSubmissions.breadcrumbSubmissions') }]} />}
        title={assignment?.title}
        description={t('dashboardInstructor.assignmentSubmissions.submissionCountGraded', {
          count: submissions.length,
          graded: submissions.filter((s) => s.status === 'graded').length,
        })}
      />

      {submissions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <p className="text-sm text-navy-700/50 dark:text-navy-100/50">{t('dashboardInstructor.assignmentSubmissions.noSubmissions')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <GradeRow key={s.id} submission={s} maxMarks={assignment.maximum_marks} rubric={assignment.rubric_detail} onGraded={handleGraded} />
          ))}
        </div>
      )}
    </div>
  )
}
