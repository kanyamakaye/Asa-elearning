import { useEffect, useState } from 'react'
import { getBankQuestions, getQuestionBanks } from '../../services/questionBankService'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Checkbox from '../ui/Checkbox'
import Button from '../ui/Button'

const TYPE_LABELS = {
  multiple_choice: 'Multiple Choice', multiple_select: 'Multiple Select', true_false: 'True/False',
  short_answer: 'Short Answer', essay: 'Essay', matching: 'Matching', fill_blank: 'Fill in the Blank',
  ordering: 'Ordering', numerical: 'Numerical', numeric_range: 'Numeric Range',
}

// Copies selected bank questions into the quiz's local `questions` array
// (question.md #13/#20 — a quiz's questions are independent copies, not
// live references to the bank, so later bank edits never retroactively
// change a quiz a student may have attempted).
export default function AddFromBankModal({ open, onClose, onAdd }) {
  const [banks, setBanks] = useState([])
  const [bankId, setBankId] = useState('')
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setBankId('')
    setQuestions([])
    setSelected([])
    setError('')
    getQuestionBanks().then((data) => setBanks(data.results ?? data)).catch(() => setBanks([]))
  }, [open])

  useEffect(() => {
    if (!bankId) {
      setQuestions([])
      return
    }
    setLoading(true)
    setSelected([])
    getBankQuestions(bankId)
      .then((data) => setQuestions(data.results ?? data))
      .catch(() => setError('Could not load this bank’s questions.'))
      .finally(() => setLoading(false))
  }, [bankId])

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function handleAdd() {
    const picked = questions.filter((q) => selected.includes(q.id)).map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      marks: q.marks,
      explanation: q.explanation,
      config: q.config ?? {},
      options: (q.options ?? []).map(({ option_text, is_correct, order }) => ({ option_text, is_correct, order })),
    }))
    onAdd(picked)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Questions from Bank"
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" disabled={selected.length === 0} onClick={handleAdd}>
            Add {selected.length > 0 ? `${selected.length} ` : ''}Question{selected.length === 1 ? '' : 's'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        <div>
          <span className="text-xs font-semibold text-navy-700/60">Question Bank</span>
          <Select className="mt-1.5" value={bankId} onChange={(e) => setBankId(e.target.value)}>
            <option value="">Select a bank…</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.title} ({b.question_count})</option>
            ))}
          </Select>
        </div>

        {bankId && (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-sm text-navy-700/45">Loading questions…</p>
            ) : questions.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-700/45">This bank has no questions yet.</p>
            ) : (
              questions.map((q) => (
                <label
                  key={q.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 ring-navy-900/8 hover:bg-navy-50/60"
                >
                  <Checkbox checked={selected.includes(q.id)} onChange={() => toggle(q.id)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900">{q.question_text}</p>
                    <p className="mt-0.5 text-xs text-navy-700/50">
                      {TYPE_LABELS[q.question_type] ?? q.question_type} · {q.marks} mark{q.marks === 1 ? '' : 's'} · {q.difficulty}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
