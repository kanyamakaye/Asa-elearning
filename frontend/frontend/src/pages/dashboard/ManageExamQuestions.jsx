import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  activateExam, addExamQuestion, deleteExamQuestion, getExam, getExamQuestions, updateExamQuestion,
} from '../../lib/dashboardApi'
import QuestionBuilder from '../../components/quizzes/QuestionBuilder'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import { IconCheck } from '../../components/icons'

/** Adding/editing exam questions was previously impossible — Exam only
 * carried scheduling metadata. Reuses the same QuestionBuilder/QuestionEditor
 * stack as CreateQuiz's question step, saved all-at-once like that flow. */
export default function ManageExamQuestions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [deletedIds, setDeletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getExam(id, accessToken), getExamQuestions(id, accessToken)])
      .then(([examData, questionsData]) => {
        if (cancelled) return
        setExam(examData)
        setQuestions(questionsData)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, accessToken])

  function onQuestionsChange(next) {
    const removedIds = questions.filter((q) => q.id && !next.some((n) => n.id === q.id)).map((q) => q.id)
    if (removedIds.length) setDeletedIds((d) => [...d, ...removedIds])
    setQuestions(next)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      for (const question of questions) {
        if (question.id) await updateExamQuestion(question.id, question, accessToken)
        else await addExamQuestion(id, question, accessToken)
      }
      for (const questionId of deletedIds) {
        await deleteExamQuestion(questionId, accessToken)
      }
      setDeletedIds([])
      const refreshed = await getExamQuestions(id, accessToken)
      setQuestions(refreshed)
      setSuccess('Questions saved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleActivate() {
    setActivating(true)
    setError('')
    try {
      const result = await activateExam(id, accessToken)
      setExam(result.data)
      setSuccess('Exam activated — students can now start it.')
    } catch (err) {
      setError(err.message)
    } finally {
      setActivating(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading exam…" />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Exams', to: '/dashboard/exams' }, { label: exam?.title ?? 'Questions' }]} />}
        title={exam?.title}
        description={`${questions.length} question${questions.length === 1 ? '' : 's'} · status: ${exam?.status ?? '—'}`}
        actions={
          exam?.status === 'scheduled' && (
            <Button variant="secondary" loading={activating} disabled={activating || questions.length === 0} onClick={handleActivate}>
              <IconCheck className="h-4 w-4" /> {activating ? 'Activating…' : 'Activate Exam'}
            </Button>
          )
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <QuestionBuilder questions={questions} onChange={onQuestionsChange} />

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/exams')}>Back to Exams</Button>
        <Button type="button" loading={saving} disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Questions'}
        </Button>
      </div>
    </div>
  )
}
