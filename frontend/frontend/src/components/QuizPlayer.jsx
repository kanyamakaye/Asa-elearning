import { useEffect, useMemo, useState } from 'react'
import {
  answerExamQuestion, answerQuizQuestion, getExam, getMyExamAttempts, getMyQuizAttempts, getQuiz,
  startExamAttempt, startQuizAttempt, submitExamAttempt, submitQuizAttempt,
} from '../lib/queries'
import LoadingSpinner from './ui/LoadingSpinner'
import { IconAward, IconCheck, IconClipboard, IconClock, IconClose, IconRefresh } from './icons'

const GRADED_TYPES = new Set(['multiple_choice', 'multiple_select', 'true_false'])

// Exam attempts are structurally identical to quiz attempts (same
// question/option/answer shape, same auto-grade rules) — the /exams/
// endpoints just mirror /quizzes/ one-for-one, so this component drives
// both instead of duplicating ~300 lines for an ExamPlayer.
const API_BY_KIND = {
  quiz: {
    getDetail: getQuiz, getAttempts: getMyQuizAttempts, start: startQuizAttempt,
    answer: answerQuizQuestion, submit: submitQuizAttempt,
  },
  exam: {
    getDetail: getExam, getAttempts: getMyExamAttempts, start: startExamAttempt,
    answer: answerExamQuestion, submit: submitExamAttempt,
  },
}

function OptionInput({ question, options, value, onChange, disabled }) {
  return (
    <div className="mt-3 space-y-2">
      {options.map((option) => (
        <label
          key={option.id}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
            value === option.id
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-navy-900/10 text-navy-800 hover:bg-navy-50/60'
          } ${disabled ? 'cursor-default opacity-80' : ''}`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            className="h-4 w-4 shrink-0 accent-brand-500"
            checked={value === option.id}
            disabled={disabled}
            onChange={() => onChange(option.id)}
          />
          {option.option_text}
        </label>
      ))}
    </div>
  )
}

export default function QuizPlayer({ quiz, accessToken, kind = 'quiz' }) {
  const api = API_BY_KIND[kind]
  const label = kind === 'exam' ? 'Exam' : 'Quiz'
  const [quizDetail, setQuizDetail] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [currentAttempt, setCurrentAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([api.getDetail(quiz.id, accessToken), api.getAttempts(quiz.id, accessToken)])
      .then(([detail, attemptsData]) => {
        if (cancelled) return
        setQuizDetail(detail)
        const list = attemptsData.results ?? attemptsData
        setAttempts(list)
        const inProgress = list.find((a) => a.status === 'in_progress')
        const latest = inProgress ?? list[0] ?? null
        setCurrentAttempt(latest)
        if (inProgress) {
          const map = {}
          inProgress.answers.forEach((a) => {
            map[a.question] = { selected_option: a.selected_option, answer_text: a.answer_text }
          })
          setAnswers(map)
        } else {
          setAnswers({})
        }
      })
      .catch((err) => !cancelled && setError(err.message || 'Unable to load this quiz.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [quiz.id, accessToken, kind]) // eslint-disable-line react-hooks/exhaustive-deps

  const attemptsUsed = attempts.length
  const attemptsRemaining = Math.max(0, quiz.attempt_limit - attemptsUsed)
  const phase = currentAttempt ? currentAttempt.status : 'intro'

  const questionById = useMemo(() => {
    const map = {}
    ;(quizDetail?.questions ?? []).forEach((q) => {
      map[q.id] = q
    })
    return map
  }, [quizDetail])

  async function handleStart() {
    setBusy(true)
    setError('')
    try {
      const attempt = await api.start(quiz.id, accessToken)
      setCurrentAttempt(attempt)
      setAttempts((prev) => [attempt, ...prev])
      setAnswers({})
    } catch (err) {
      setError(err.message || 'Unable to start this quiz right now.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSelectOption(questionId, optionId) {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], selected_option: optionId } }))
    try {
      await api.answer(currentAttempt.id, { question: questionId, selected_option: optionId }, accessToken)
    } catch {
      // Non-fatal — the selection stays visible locally; submit() below still
      // sends the final answer set and will surface any real failure then.
    }
  }

  async function handleTextAnswer(questionId, text) {
    try {
      await api.answer(currentAttempt.id, { question: questionId, answer_text: text }, accessToken)
    } catch {
      // See handleSelectOption — kept non-fatal for the same reason.
    }
  }

  async function handleSubmit() {
    setBusy(true)
    setError('')
    try {
      const result = await api.submit(currentAttempt.id, accessToken)
      setCurrentAttempt(result)
      setAttempts((prev) => [result, ...prev.filter((a) => a.id !== result.id)])
    } catch (err) {
      setError(err.message || 'Unable to submit this quiz right now.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading quiz…" className="min-h-[40vh]" />
  if (!quizDetail) {
    return <p className="text-sm text-navy-700/55">{error || 'This quiz is not available right now.'}</p>
  }

  const questions = quizDetail.questions ?? []
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id]
    return a && (a.selected_option || (a.answer_text && a.answer_text.trim()))
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <IconClipboard className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{quiz.title}</h1>
          {quizDetail.description && (
            <p className="mt-1 text-sm leading-relaxed text-navy-700/65">{quizDetail.description}</p>
          )}
        </div>
      </div>

      {phase === 'intro' && (
        <div className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
          {quizDetail.instructions && <p className="text-sm text-navy-700/70">{quizDetail.instructions}</p>}
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-navy-700/55">
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5" /> {quiz.duration_minutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconClipboard className="h-3.5 w-3.5" /> {questions.length} question{questions.length === 1 ? '' : 's'}
            </span>
            <span>Passing score: {quiz.passing_marks}/{quiz.total_marks}</span>
            <span>{attemptsRemaining} of {quiz.attempt_limit} attempts left</span>
          </div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleStart}
            disabled={busy || attemptsRemaining <= 0}
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
          >
            {busy ? 'Starting…' : attemptsRemaining <= 0 ? 'No attempts remaining' : `Start ${label}`}
          </button>
        </div>
      )}

      {phase === 'in_progress' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-700/55">
            <span>{answeredCount} of {questions.length} answered</span>
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5" /> {quiz.duration_minutes} min
            </span>
          </div>

          {questions.map((question, i) => (
            <div key={question.id} className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
              <p className="text-sm font-semibold text-navy-900">
                {i + 1}. {question.question_text}
              </p>
              {GRADED_TYPES.has(question.question_type) ? (
                <OptionInput
                  question={question}
                  options={question.options ?? []}
                  value={answers[question.id]?.selected_option}
                  onChange={(optionId) => handleSelectOption(question.id, optionId)}
                />
              ) : (
                <textarea
                  rows={3}
                  defaultValue={answers[question.id]?.answer_text ?? ''}
                  onBlur={(e) => handleTextAnswer(question.id, e.target.value)}
                  placeholder="Type your answer…"
                  className="mt-3 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-800 outline-none focus:border-brand-500"
                />
              )}
            </div>
          ))}

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
          >
            {busy ? 'Submitting…' : `Submit ${label}`}
          </button>
        </div>
      )}

      {(phase === 'submitted' || phase === 'graded') && (
        <div className="space-y-5">
          <div
            className={`flex items-center gap-4 rounded-2xl p-6 ring-1 ${
              currentAttempt.passed ? 'bg-emerald-50 ring-emerald-100' : 'bg-amber-50 ring-amber-100'
            }`}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                currentAttempt.passed ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
              }`}
            >
              {currentAttempt.passed ? <IconAward className="h-6 w-6" /> : <IconClose className="h-6 w-6" />}
            </span>
            <div>
              <p className="text-lg font-extrabold text-navy-900">
                {currentAttempt.passed ? 'Nice work — you passed!' : "You didn't quite pass this time"}
              </p>
              <p className="text-sm text-navy-700/65">
                Score: {currentAttempt.score}/{quiz.total_marks} ({currentAttempt.percentage}%)
                {currentAttempt.status === 'submitted' && ' — some answers are still pending manual review.'}
              </p>
            </div>
          </div>

          {quizDetail.show_answers !== false && (
            <div className="space-y-4">
              {currentAttempt.answers.map((answer, i) => {
                const question = questionById[answer.question]
                if (!question) return null
                return (
                  <div key={answer.id} className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-navy-900">
                        {i + 1}. {question.question_text}
                      </p>
                      {GRADED_TYPES.has(question.question_type) && (
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            answer.is_correct ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {answer.is_correct ? <IconCheck className="h-3.5 w-3.5" /> : <IconClose className="h-3.5 w-3.5" />}
                        </span>
                      )}
                    </div>
                    {GRADED_TYPES.has(question.question_type) ? (
                      <ul className="mt-3 space-y-1.5">
                        {(question.options ?? []).map((option) => {
                          const isSelected = answer.selected_option === option.id
                          return (
                            <li
                              key={option.id}
                              className={`rounded-lg px-3 py-2 text-sm ${
                                isSelected
                                  ? answer.is_correct
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                                  : 'text-navy-700/60'
                              }`}
                            >
                              {option.option_text} {isSelected && '(your answer)'}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="mt-3 rounded-lg bg-navy-50/60 px-3 py-2 text-sm text-navy-700/80">
                        {answer.answer_text || <em>No answer submitted.</em>}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="mt-2 text-xs text-navy-700/50">{question.explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          {attemptsRemaining > 0 ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
            >
              <IconRefresh className="h-4 w-4" />
              Retake {label} ({attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} left)
            </button>
          ) : (
            <p className="text-xs font-semibold text-navy-700/45">You've used all your attempts for this quiz.</p>
          )}
        </div>
      )}
    </div>
  )
}
