import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useConfirm } from '../../../context/ConfirmContext'
import { deleteBankQuestion, getQuestionBank } from '../../../services/questionBankService'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import { QUESTION_TYPES } from '../../../components/quizzes/QuestionEditor'
import { IconEdit, IconPlus, IconTrash } from '../../../components/icons'

const TYPE_LABELS = Object.fromEntries(QUESTION_TYPES.map((t) => [t.value, t.label]))
const DIFFICULTY_TONE = { easy: 'success', medium: 'warning', hard: 'danger' }

/** Outline of the questions inside one QuestionBank — separate from a
 * quiz's own question list (QuestionBuilder), since bank questions are
 * reusable across many quizzes (question.md #13) rather than tied to one.
 * Adding/editing a question is its own dedicated page (BankQuestionEditor),
 * not an inline card here — same pattern as course submodules. */
export default function QuestionBankDetail() {
  const { id } = useParams()
  const confirm = useConfirm()
  const [bank, setBank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    getQuestionBank(id)
      .then((data) => setBank(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function removeQuestion(q) {
    const { confirmed, reason } = await confirm('Delete this question from the bank?')
    if (!confirmed) return
    setBusyId(q.id)
    try {
      await deleteBankQuestion(q.id, reason)
      load()
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading question bank…" />

  if (error) return <Alert tone="error">{error}</Alert>

  const questions = bank?.questions ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Question Banks', to: '/dashboard/question-banks' }, { label: bank?.title ?? 'Bank' }]} />}
        title={bank?.title}
        description={bank?.description || 'Manage the questions in this bank.'}
        actions={<Button as={Link} to={`/dashboard/question-banks/${id}/questions/new`}><IconPlus className="h-4 w-4" /> Add Question</Button>}
      />

      <div className="space-y-3">
        {questions.length === 0 ? (
          <p className="rounded-xl bg-navy-50 p-6 text-center text-sm text-navy-700/50">
            No questions in this bank yet.
          </p>
        ) : (
          questions.map((q, i) => (
            <div key={q.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-navy-900/8">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-navy-900">{i + 1}. {q.question_text}</span>
                <span className="mt-0.5 flex items-center gap-2 text-[11px] uppercase tracking-wide text-navy-700/40">
                  {TYPE_LABELS[q.question_type] ?? q.question_type} · {q.marks} mark{q.marks === 1 ? '' : 's'}
                </span>
              </span>
              <Badge tone={DIFFICULTY_TONE[q.difficulty] ?? 'neutral'}>{q.difficulty}</Badge>
              <div className="flex items-center gap-0.5">
                <Link to={`/dashboard/question-banks/${id}/questions/${q.id}/edit`} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50" aria-label="Edit question">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === q.id} onClick={() => removeQuestion(q)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40" aria-label="Delete question">
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button type="button" variant="secondary" as={Link} to={`/dashboard/question-banks/${id}/questions/new`}>
        <IconPlus className="h-4 w-4" /> Add Question
      </Button>
    </div>
  )
}
