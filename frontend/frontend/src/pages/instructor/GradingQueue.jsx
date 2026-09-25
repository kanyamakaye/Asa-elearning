import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { gradeExamAnswer, gradeQuizAnswer, listAttemptsNeedingGrading } from '../../lib/dashboardApi'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import Textarea from '../../components/ui/Textarea'

const ESSAY_TYPES = new Set(['essay', 'short_answer'])

function AnswerGradeRow({ kind, attempt, answer, onGraded }) {
  const { t } = useLanguage()
  const { accessToken } = useAuth()
  const [marks, setMarks] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (marks === '' || Number(marks) < 0 || Number(marks) > answer.max_marks) {
      setError(t('dashboardInstructor.gradingQueue.scoreRangeError', { max: answer.max_marks }))
      return
    }
    setSaving(true)
    setError('')
    try {
      const grade = kind === 'exam' ? gradeExamAnswer : gradeQuizAnswer
      const result = await grade(attempt.id, { answer_id: answer.id, marks_awarded: marks, feedback }, accessToken)
      onGraded(attempt.id, answer.id, result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl bg-navy-50/60 p-4 dark:bg-white/5">
      <p className="text-sm font-semibold text-navy-900 dark:text-white">{answer.question_text}</p>
      <p className="mt-1 rounded-lg bg-white p-3 text-sm text-navy-800 dark:bg-navy-800 dark:text-navy-100">
        {answer.answer_text || <em className="text-navy-700/45 dark:text-navy-100/45">{t('dashboardInstructor.gradingQueue.noAnswerSubmitted')}</em>}
      </p>
      {error && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
        <div>
          <span className="text-xs font-semibold text-navy-700/60 dark:text-navy-100/60">{t('dashboardInstructor.gradingQueue.scoreOutOf', { max: answer.max_marks })}</span>
          <Input type="number" min="0" max={answer.max_marks} className="mt-1.5" value={marks} onChange={(e) => setMarks(e.target.value)} />
        </div>
        <div>
          <span className="text-xs font-semibold text-navy-700/60 dark:text-navy-100/60">{t('dashboardInstructor.gradingQueue.feedback')}</span>
          <Textarea rows={1} className="mt-1.5" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>
        <Button size="sm" loading={saving} disabled={saving} onClick={submit}>
          {saving ? t('dashboardInstructor.gradingQueue.saving') : t('dashboardInstructor.gradingQueue.grade')}
        </Button>
      </div>
    </div>
  )
}

function AttemptCard({ kind, attempt, onGraded }) {
  const { t } = useLanguage()
  const ungraded = attempt.answers.filter((a) => ESSAY_TYPES.has(a.question_type) && !a.graded_at)
  if (ungraded.length === 0) return null

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-navy-900 dark:text-white">{attempt.student?.full_name ?? attempt.student?.username}</p>
          <p className="text-xs text-navy-700/45 dark:text-navy-100/45">
            {kind === 'exam' ? attempt.exam_title : attempt.quiz_title} · {attempt.course_title}
          </p>
        </div>
        <span className="text-xs font-semibold text-navy-700/50 dark:text-navy-100/50">
          {t('dashboardInstructor.gradingQueue.answersToGrade', { count: ungraded.length })}
        </span>
      </div>
      {ungraded.map((answer) => (
        <AnswerGradeRow key={answer.id} kind={kind} attempt={attempt} answer={answer} onGraded={onGraded} />
      ))}
    </div>
  )
}

export default function GradingQueue() {
  const { t } = useLanguage()
  const { accessToken } = useAuth()
  const [quizAttempts, setQuizAttempts] = useState([])
  const [examAttempts, setExamAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    Promise.all([
      listAttemptsNeedingGrading('quiz', accessToken),
      listAttemptsNeedingGrading('exam', accessToken),
    ])
      .then(([quizData, examData]) => {
        setQuizAttempts(quizData.results ?? quizData)
        setExamAttempts(examData.results ?? examData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleGraded(kind, attemptId, answerId, updatedAttempt) {
    const setter = kind === 'exam' ? setExamAttempts : setQuizAttempts
    setter((prev) => {
      if (updatedAttempt.status === 'graded') {
        // Nothing left to grade on this attempt — drop it from the queue.
        return prev.filter((a) => a.id !== attemptId)
      }
      return prev.map((a) => (a.id === attemptId ? updatedAttempt : a))
    })
  }

  const totalPending = quizAttempts.length + examAttempts.length

  if (loading) return <LoadingSpinner label={t('dashboardInstructor.gradingQueue.loadingQueue')} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t('dashboardInstructor.gradingQueue.heading')}
        description={totalPending === 0 ? t('dashboardInstructor.gradingQueue.nothingToGrade') : t('dashboardInstructor.gradingQueue.attemptsAwaiting', { count: totalPending })}
      />

      {error && <Alert tone="error">{error}</Alert>}

      {totalPending === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <p className="text-sm text-navy-700/50 dark:text-navy-100/50">{t('dashboardInstructor.gradingQueue.allCaughtUp')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizAttempts.map((attempt) => (
            <AttemptCard key={`quiz-${attempt.id}`} kind="quiz" attempt={attempt} onGraded={(...args) => handleGraded('quiz', ...args)} />
          ))}
          {examAttempts.map((attempt) => (
            <AttemptCard key={`exam-${attempt.id}`} kind="exam" attempt={attempt} onGraded={(...args) => handleGraded('exam', ...args)} />
          ))}
        </div>
      )}
    </div>
  )
}
