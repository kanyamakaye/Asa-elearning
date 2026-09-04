import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addQuestion, createQuiz, deleteQuestion, getQuestions, getQuiz, publishQuiz, updateQuestion, updateQuiz,
} from '../../../services/quizService'
import useCourseOptions from '../../../hooks/useCourseOptions'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import QuestionBuilder from '../../../components/quizzes/QuestionBuilder'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'

const STEPS = ['Quiz Information', 'Configuration', 'Questions', 'Availability']

const INITIAL_FORM = {
  course: '',
  title: '',
  description: '',
  instructions: '',
  duration_minutes: '30',
  total_marks: '100',
  passing_marks: '50',
  attempt_limit: '1',
  shuffle_questions: false,
  show_answers: true,
  available_from: '',
  available_until: '',
}

function toFormShape(quiz) {
  return {
    course: quiz.course,
    title: quiz.title,
    description: quiz.description,
    instructions: quiz.instructions ?? '',
    duration_minutes: String(quiz.duration_minutes),
    total_marks: String(quiz.total_marks),
    passing_marks: String(quiz.passing_marks),
    attempt_limit: String(quiz.attempt_limit),
    shuffle_questions: quiz.shuffle_questions,
    show_answers: quiz.show_answers,
    available_from: quiz.available_from ? quiz.available_from.slice(0, 16) : '',
    available_until: quiz.available_until ? quiz.available_until.slice(0, 16) : '',
  }
}

export default function CreateQuiz() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { courses } = useCourseOptions()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [questions, setQuestions] = useState([])
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    Promise.all([getQuiz(id), getQuestions(id)]).then(([quiz, qs]) => {
      if (cancelled) return
      setForm(toFormShape(quiz))
      setQuestions(qs)
    }).catch((err) => !cancelled && setSubmitError(err.message))
      .finally(() => !cancelled && setInitialLoading(false))
    return () => { cancelled = true }
  }, [id, isEdit])

  function onQuestionsChange(next) {
    const removedIds = questions.filter((q) => q.id && !next.some((n) => n.id === q.id)).map((q) => q.id)
    if (removedIds.length) setDeletedQuestionIds((d) => [...d, ...removedIds])
    setQuestions(next)
  }

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM) || questions.length > 0,
    [form, questions]
  )
  useUnsavedChanges(dirty && !success)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validateStep(index) {
    const next = {}
    if (index === 0) {
      if (form.title.trim().length < 3) next.title = 'Must be at least 3 characters long.'
      if (!form.course) next.course = 'This field is required.'
    }
    if (index === 1) {
      if (Number(form.passing_marks) > Number(form.total_marks)) next.passing_marks = 'Cannot exceed the total marks.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit(publish) {
    if (!validateStep(0) || !validateStep(1)) {
      setStep(0)
      return
    }
    if (publish && questions.length === 0) {
      setSubmitError('Add at least one question before publishing this quiz.')
      setStep(2)
      return
    }
    setLoading(true)
    setSubmitError('')
    try {
      const payload = {
        ...form,
        available_from: form.available_from ? new Date(form.available_from).toISOString() : undefined,
        available_until: form.available_until ? new Date(form.available_until).toISOString() : undefined,
      }
      const quizId = isEdit ? id : (await createQuiz(payload)).data.id
      if (isEdit) await updateQuiz(quizId, payload)
      for (const question of questions) {
        if (question.id) await updateQuestion(question.id, question)
        else await addQuestion(quizId, question)
      }
      for (const questionId of deletedQuestionIds) {
        await deleteQuestion(questionId)
      }
      if (publish) await publishQuiz(quizId)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/quizzes'), 1200)
    } catch (err) {
      setSubmitError(err.message)
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <LoadingSpinner label="Loading quiz…" />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={`Quiz ${isEdit ? 'updated' : 'created'} successfully.`}>Redirecting…</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Quizzes', to: '/dashboard/quizzes' }, { label: isEdit ? 'Edit Quiz' : 'Create Quiz' }]} />}
        title={isEdit ? 'Edit Quiz' : 'Create a Quiz'}
        description="Build your quiz, then add questions before publishing."
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              i === step ? 'bg-navy-900 text-white' : i < step ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-50 text-navy-700/60'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Quiz Title" required error={errors.title} className="sm:col-span-2">
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
            </FormField>
            <FormField label="Course" required error={errors.course}>
              <Select value={form.course} onChange={(e) => update('course', e.target.value)} error={errors.course}>
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <Textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
            </FormField>
            <FormField label="Instructions" className="sm:col-span-2">
              <Textarea rows={3} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} />
            </FormField>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Time Limit (minutes)">
              <Input type="number" min="0" value={form.duration_minutes} onChange={(e) => update('duration_minutes', e.target.value)} />
            </FormField>
            <FormField label="Maximum Attempts">
              <Input type="number" min="1" value={form.attempt_limit} onChange={(e) => update('attempt_limit', e.target.value)} />
            </FormField>
            <FormField label="Total Marks">
              <Input type="number" min="1" value={form.total_marks} onChange={(e) => update('total_marks', e.target.value)} />
            </FormField>
            <FormField label="Passing Marks" error={errors.passing_marks}>
              <Input type="number" min="0" value={form.passing_marks} onChange={(e) => update('passing_marks', e.target.value)} error={errors.passing_marks} />
            </FormField>
            <div className="flex flex-col gap-3 sm:col-span-2">
              <Checkbox label="Randomize question order" checked={form.shuffle_questions} onChange={(e) => update('shuffle_questions', e.target.checked)} />
              <Checkbox label="Show results to students after submission" checked={form.show_answers} onChange={(e) => update('show_answers', e.target.checked)} />
            </div>
          </div>
        )}

        {step === 2 && <QuestionBuilder questions={questions} onChange={onQuestionsChange} />}

        {step === 3 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Available From" hint="Optional">
              <Input type="datetime-local" value={form.available_from} onChange={(e) => update('available_from', e.target.value)} />
            </FormField>
            <FormField label="Available Until" hint="Optional">
              <Input type="datetime-local" value={form.available_until} onChange={(e) => update('available_until', e.target.value)} />
            </FormField>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/quizzes')}>Cancel</Button>
        <div className="flex gap-3">
          {step > 0 && <Button type="button" variant="outline" onClick={goBack}>Back</Button>}
          {step < STEPS.length - 1 && <Button type="button" onClick={goNext}>Next</Button>}
          {step === STEPS.length - 1 && (
            <>
              <Button type="button" variant="secondary" loading={loading} disabled={loading} onClick={() => handleSubmit(false)}>
                {loading ? (isEdit ? 'Saving…' : 'Creating Quiz…') : 'Save Draft'}
              </Button>
              <Button type="button" loading={loading} disabled={loading} onClick={() => handleSubmit(true)}>
                {loading ? (isEdit ? 'Saving…' : 'Creating Quiz…') : 'Publish Quiz'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
