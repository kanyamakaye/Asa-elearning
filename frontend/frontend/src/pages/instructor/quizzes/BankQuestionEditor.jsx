import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createBankQuestion, deleteBankQuestion, getBankQuestion, getQuestionBank, updateBankQuestion,
} from '../../../services/questionBankService'
import { useConfirm } from '../../../context/ConfirmContext'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import QuestionEditor, { emptyOption } from '../../../components/quizzes/QuestionEditor'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/ui/FormField'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import { IconTrash } from '../../../components/icons'

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

function emptyQuestion() {
  return {
    question_text: '', question_type: 'multiple_choice', marks: 1, difficulty: 'medium',
    tags: [], explanation: '', config: {}, options: [emptyOption(), emptyOption()],
  }
}

/** Full-page create/edit for a single question bank entry — was previously
 * an inline card appended to a growing list on the bank's own page (saved
 * all-at-once). A dedicated page per question, saved immediately, gives
 * each question room to breathe and matches the submodule editor pattern. */
export default function BankQuestionEditor() {
  const { bankId, questionId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const isEdit = Boolean(questionId)

  const [bank, setBank] = useState(null)
  const [question, setQuestion] = useState(emptyQuestion())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const dirty = useMemo(() => JSON.stringify(question) !== JSON.stringify(emptyQuestion()), [question])
  useUnsavedChanges(dirty && !success)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([getQuestionBank(bankId), isEdit ? getBankQuestion(questionId) : Promise.resolve(null)])
      .then(([bankData, questionData]) => {
        if (cancelled) return
        setBank(bankData)
        if (questionData) {
          setQuestion({
            question_text: questionData.question_text, question_type: questionData.question_type,
            marks: questionData.marks, difficulty: questionData.difficulty, tags: questionData.tags ?? [],
            explanation: questionData.explanation, config: questionData.config ?? {},
            options: questionData.options ?? [],
          })
        }
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [bankId, questionId, isEdit])

  async function handleSave() {
    if (!question.question_text.trim()) return setError('Question text is required.')
    setError('')
    setSaving(true)
    try {
      const payload = { ...question, bank: bankId }
      if (isEdit) await updateBankQuestion(questionId, payload)
      else await createBankQuestion(payload)
      setSuccess(true)
      setTimeout(() => navigate(`/dashboard/question-banks/${bankId}`), 900)
    } catch (err) {
      setError(err.message || 'Could not save this question.')
      if (err.errors) setError(JSON.stringify(err.errors))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const { confirmed, reason } = await confirm('Delete this question from the bank?')
    if (!confirmed) return
    setDeleting(true)
    try {
      await deleteBankQuestion(questionId, reason)
      navigate(`/dashboard/question-banks/${bankId}`)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading question…" />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Question saved successfully.">Redirecting…</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Question Banks', to: '/dashboard/question-banks' },
              { label: bank?.title ?? 'Bank' },
            ]}
          />
        }
        title={isEdit ? 'Edit Question' : 'Add Question'}
        description={bank ? `In bank: ${bank.title}` : undefined}
      />

      {error && <Alert tone="error">{error}</Alert>}

      <QuestionEditor index={0} question={question} onChange={setQuestion} showControls={false} />

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="mb-4 text-sm font-bold text-navy-900">Classification</h2>
        <FormField label="Difficulty">
          <Select value={question.difficulty} onChange={(e) => setQuestion((q) => ({ ...q, difficulty: e.target.value }))} className="max-w-xs">
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
        </FormField>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(`/dashboard/question-banks/${bankId}`)}>Cancel</Button>
          {isEdit && (
            <Button type="button" variant="danger" loading={deleting} disabled={deleting} onClick={handleDelete}>
              <IconTrash className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
        <Button type="button" loading={saving} disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Question'}
        </Button>
      </div>
    </div>
  )
}
