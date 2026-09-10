import { useState } from 'react'
import Button from '../ui/Button'
import { IconPlus } from '../icons'
import QuestionEditor, { emptyOption } from './QuestionEditor'
import AddFromBankModal from './AddFromBankModal'

function emptyQuestion() {
  return {
    question_text: '',
    question_type: 'multiple_choice',
    marks: 1,
    explanation: '',
    options: [emptyOption(), emptyOption()],
  }
}

/** Purely local, controlled question list — the whole list is persisted to
 * the backend at once (see CreateQuiz.jsx), since questions are created
 * independently of the quiz record per course.md #47. */
export default function QuestionBuilder({ questions, onChange, errors = {} }) {
  const [bankModalOpen, setBankModalOpen] = useState(false)

  function addQuestion() {
    onChange([...questions, emptyQuestion()])
  }

  function addFromBank(picked) {
    onChange([...questions, ...picked])
  }

  function updateQuestion(i, next) {
    onChange(questions.map((q, idx) => (idx === i ? next : q)))
  }

  function deleteQuestion(i) {
    onChange(questions.filter((_, idx) => idx !== i))
  }

  function move(i, delta) {
    const j = i + delta
    if (j < 0 || j >= questions.length) return
    const next = [...questions]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="rounded-xl bg-navy-50 p-6 text-center text-sm text-navy-700/50">
          No questions yet. A quiz needs at least one question before it can be published.
        </p>
      )}
      {questions.map((q, i) => (
        <QuestionEditor
          key={i}
          index={i}
          question={q}
          onChange={(next) => updateQuestion(i, next)}
          onDelete={() => deleteQuestion(i)}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          isFirst={i === 0}
          isLast={i === questions.length - 1}
          error={errors[i]}
        />
      ))}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addQuestion}>
          <IconPlus className="h-4 w-4" /> Add Question
        </Button>
        <Button type="button" variant="outline" onClick={() => setBankModalOpen(true)}>
          <IconPlus className="h-4 w-4" /> Add from Bank
        </Button>
      </div>

      <AddFromBankModal open={bankModalOpen} onClose={() => setBankModalOpen(false)} onAdd={addFromBank} />
    </div>
  )
}
