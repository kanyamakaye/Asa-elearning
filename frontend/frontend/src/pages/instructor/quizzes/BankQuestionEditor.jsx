import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
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
  { value: 'easy', labelKey: 'easy' },
  { value: 'medium', labelKey: 'medium' },
  { value: 'hard', labelKey: 'hard' },
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
  const { t } = useLanguage()
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
    if (!question.question_text.trim()) return setError(t('dashboardInstructor.bankQuestionEditor.questionTextRequired'))
    setError('')
    setSaving(true)
    try {
      const payload = { ...question, bank: bankId }
      if (isEdit) await updateBankQuestion(questionId, payload)
      else await createBankQuestion(payload)
      setSuccess(true)
      setTimeout(() => navigate(`/dashboard/question-banks/${bankId}`), 900)
    } catch (err) {
      setError(err.message || t('dashboardInstructor.bankQuestionEditor.couldNotSave'))
      if (err.errors) setError(JSON.stringify(err.errors))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const { confirmed, reason } = await confirm(t('dashboardInstructor.bankQuestionEditor.confirmDeleteQuestion'))
    if (!confirmed) return
    setDeleting(true)
    try {
      await deleteBankQuestion(questionId, reason)
      navigate(`/dashboard/question-banks/${bankId}`)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label={t('dashboardInstructor.bankQuestionEditor.loadingQuestion')} />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={t('dashboardInstructor.bankQuestionEditor.savedSuccess')}>{t('dashboardInstructor.bankQuestionEditor.redirecting')}</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: t('dashboardInstructor.bankQuestionEditor.breadcrumbDashboard'), to: '/dashboard' },
              { label: t('dashboardInstructor.bankQuestionEditor.breadcrumbQuestionBanks'), to: '/dashboard/question-banks' },
              { label: bank?.title ?? t('dashboardInstructor.bankQuestionEditor.breadcrumbBankFallback') },
            ]}
          />
        }
        title={isEdit ? t('dashboardInstructor.bankQuestionEditor.editTitle') : t('dashboardInstructor.bankQuestionEditor.addTitle')}
        description={bank ? t('dashboardInstructor.bankQuestionEditor.inBank', { title: bank.title }) : undefined}
      />

      {error && <Alert tone="error">{error}</Alert>}

      <QuestionEditor index={0} question={question} onChange={setQuestion} showControls={false} />

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
        <h2 className="mb-4 text-sm font-bold text-navy-900 dark:text-white">{t('dashboardInstructor.bankQuestionEditor.classification')}</h2>
        <FormField label={t('dashboardInstructor.bankQuestionEditor.difficulty')}>
          <Select value={question.difficulty} onChange={(e) => setQuestion((q) => ({ ...q, difficulty: e.target.value }))} className="max-w-xs">
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{t(`dashboardInstructor.bankQuestionEditor.difficulties.${d.labelKey}`)}</option>)}
          </Select>
        </FormField>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(`/dashboard/question-banks/${bankId}`)}>{t('dashboardInstructor.bankQuestionEditor.cancel')}</Button>
          {isEdit && (
            <Button type="button" variant="danger" loading={deleting} disabled={deleting} onClick={handleDelete}>
              <IconTrash className="h-4 w-4" /> {t('dashboardInstructor.bankQuestionEditor.delete')}
            </Button>
          )}
        </div>
        <Button type="button" loading={saving} disabled={saving} onClick={handleSave}>
          {saving ? t('dashboardInstructor.bankQuestionEditor.saving') : isEdit ? t('dashboardInstructor.bankQuestionEditor.saveChanges') : t('dashboardInstructor.bankQuestionEditor.addQuestion')}
        </Button>
      </div>
    </div>
  )
}
