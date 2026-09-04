import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import Radio from '../ui/Radio'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '../icons'

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'multiple_select', label: 'Multiple Select' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
]

const OPTION_BASED_TYPES = ['multiple_choice', 'multiple_select', 'true_false']

function emptyOption() {
  return { option_text: '', is_correct: false }
}

export default function QuestionEditor({ index, question, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, error }) {
  function update(field, value) {
    const next = { ...question, [field]: value }
    if (field === 'question_type' && value === 'true_false') {
      next.options = [
        { option_text: 'True', is_correct: false },
        { option_text: 'False', is_correct: false },
      ]
    }
    onChange(next)
  }

  function updateOption(i, field, value) {
    const options = question.options.map((opt, idx) => {
      if (idx !== i) {
        // Multiple choice / true-false: exactly one correct answer.
        if (field === 'is_correct' && value && question.question_type !== 'multiple_select') {
          return { ...opt, is_correct: false }
        }
        return opt
      }
      return { ...opt, [field]: value }
    })
    onChange({ ...question, options })
  }

  function addOption() {
    onChange({ ...question, options: [...question.options, emptyOption()] })
  }

  function removeOption(i) {
    onChange({ ...question, options: question.options.filter((_, idx) => idx !== i) })
  }

  const showOptions = OPTION_BASED_TYPES.includes(question.question_type)

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-navy-900">Question {index + 1}</h4>
        <div className="flex items-center gap-1.5">
          <button type="button" disabled={isFirst} onClick={onMoveUp} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30" aria-label="Move up">
            <IconArrowUp className="h-4 w-4" />
          </button>
          <button type="button" disabled={isLast} onClick={onMoveDown} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30" aria-label="Move down">
            <IconArrowDown className="h-4 w-4" />
          </button>
          <button type="button" onClick={onDelete} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete question">
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <span className="text-xs font-semibold text-navy-700/60">Question Text</span>
          <Textarea rows={2} className="mt-1.5" value={question.question_text} onChange={(e) => update('question_text', e.target.value)} error={error} />
        </div>
        <div>
          <span className="text-xs font-semibold text-navy-700/60">Marks</span>
          <Input type="number" min="1" className="mt-1.5" value={question.marks} onChange={(e) => update('marks', e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs font-semibold text-navy-700/60">Question Type</span>
        <Select className="mt-1.5" value={question.question_type} onChange={(e) => update('question_type', e.target.value)}>
          {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </div>

      {showOptions && (
        <div className="mt-4 space-y-2">
          <span className="text-xs font-semibold text-navy-700/60">Options — mark the correct answer{question.question_type === 'multiple_select' ? '(s)' : ''}</span>
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {question.question_type === 'multiple_select' ? (
                <Checkbox checked={opt.is_correct} onChange={(e) => updateOption(i, 'is_correct', e.target.checked)} />
              ) : (
                <Radio name={`correct-${index}`} checked={opt.is_correct} onChange={() => updateOption(i, 'is_correct', true)} />
              )}
              <Input
                value={opt.option_text}
                onChange={(e) => updateOption(i, 'option_text', e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1"
                disabled={question.question_type === 'true_false'}
              />
              {question.question_type !== 'true_false' && (
                <button type="button" onClick={() => removeOption(i)} className="text-navy-700/40 hover:text-red-600">
                  <IconTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {question.question_type !== 'true_false' && (
            <Button type="button" variant="secondary" size="sm" onClick={addOption}>
              <IconPlus className="h-3.5 w-3.5" /> Add Option
            </Button>
          )}
        </div>
      )}

      <div className="mt-4">
        <span className="text-xs font-semibold text-navy-700/60">Explanation</span>
        <Textarea rows={2} className="mt-1.5" value={question.explanation} onChange={(e) => update('explanation', e.target.value)} placeholder="Shown to students after grading (optional)." />
      </div>
    </div>
  )
}

export { emptyOption, QUESTION_TYPES }
