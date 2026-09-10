import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createBankQuestion, deleteBankQuestion, getQuestionBank, updateBankQuestion,
} from '../../../services/questionBankService'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import QuestionEditor, { emptyOption } from '../../../components/quizzes/QuestionEditor'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import { IconPlus } from '../../../components/icons'

function emptyQuestion() {
  return {
    question_text: '', question_type: 'multiple_choice', marks: 1, difficulty: 'medium',
    tags: [], explanation: '', config: {}, options: [emptyOption(), emptyOption()],
  }
}

/** Manages the questions inside one QuestionBank — separate from a quiz's
 * own question list (QuestionBuilder), since bank questions are reusable
 * across many quizzes (question.md #13) rather than tied to one. */
export default function QuestionBankDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bank, setBank] = useState(null)
  const [questions, setQuestions] = useState([])
  const [deletedIds, setDeletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    getQuestionBank(id).then((data) => {
      if (cancelled) return
      setBank(data)
      setQuestions(data.questions ?? [])
    }).catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id])

  const dirty = useMemo(() => questions.length > 0 || deletedIds.length > 0, [questions, deletedIds])
  useUnsavedChanges(dirty && !success)

  function updateQuestion(i, next) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? next : q)))
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()])
  }

  function deleteQuestion(i) {
    const q = questions[i]
    if (q.id) setDeletedIds((d) => [...d, q.id])
    setQuestions((qs) => qs.filter((_, idx) => idx !== i))
  }

  function move(i, delta) {
    const j = i + delta
    if (j < 0 || j >= questions.length) return
    setQuestions((qs) => {
      const next = [...qs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      for (const question of questions) {
        const payload = { ...question, bank: id }
        if (question.id) await updateBankQuestion(question.id, payload)
        else await createBankQuestion(payload)
      }
      for (const questionId of deletedIds) {
        await deleteBankQuestion(questionId)
      }
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/question-banks'), 1000)
    } catch (err) {
      setError(err.message || 'Could not save these questions.')
      if (err.errors) setError(JSON.stringify(err.errors))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading question bank…" />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Question bank saved.">Redirecting…</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Question Banks', to: '/dashboard/question-banks' }, { label: bank?.title ?? 'Bank' }]} />}
        title={bank?.title}
        description={bank?.description || 'Manage the questions in this bank.'}
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="space-y-4">
        {questions.length === 0 && (
          <p className="rounded-xl bg-navy-50 p-6 text-center text-sm text-navy-700/50">
            No questions in this bank yet.
          </p>
        )}
        {questions.map((q, i) => (
          <QuestionEditor
            key={q.id ?? `new-${i}`}
            index={i}
            question={q}
            onChange={(next) => updateQuestion(i, next)}
            onDelete={() => deleteQuestion(i)}
            onMoveUp={() => move(i, -1)}
            onMoveDown={() => move(i, 1)}
            isFirst={i === 0}
            isLast={i === questions.length - 1}
          />
        ))}
        <Button type="button" variant="secondary" onClick={addQuestion}>
          <IconPlus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/question-banks')}>Cancel</Button>
        <Button type="button" loading={saving} disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
