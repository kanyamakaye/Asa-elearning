import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { createQuestionBank } from '../../../services/questionBankService'
import { getCategories } from '../../../services/courseService'
import useCourseOptions from '../../../hooks/useCourseOptions'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'

const INITIAL_FORM = { title: '', description: '', category: '', course: '' }

export default function CreateQuestionBank() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { courses } = useCourseOptions()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getCategories().then((data) => setCategories(data.results ?? data)).catch(() => {})
  }, [])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM), [form])
  useUnsavedChanges(dirty && !success)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const next = {}
    if (form.title.trim().length < 3) next.title = t('dashboardInstructor.createQuestionBank.errors.titleMinLength')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const res = await createQuestionBank({
        title: form.title,
        description: form.description,
        category: form.category || null,
        course: form.course || null,
      })
      setSuccess(true)
      setTimeout(() => navigate(`/dashboard/question-banks/${res.data.id}`), 1200)
    } catch (err) {
      setSubmitError(err.message || t('dashboardInstructor.createQuestionBank.couldNotCreate'))
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={t('dashboardInstructor.createQuestionBank.createdSuccess')}>{t('dashboardInstructor.createQuestionBank.redirecting')}</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: t('dashboardInstructor.createQuestionBank.breadcrumbDashboard'), to: '/dashboard' },
              { label: t('dashboardInstructor.createQuestionBank.breadcrumbQuestionBanks'), to: '/dashboard/question-banks' },
              { label: t('dashboardInstructor.createQuestionBank.breadcrumbNewBank') },
            ]}
          />
        }
        title={t('dashboardInstructor.createQuestionBank.pageHeading')}
        description={t('dashboardInstructor.createQuestionBank.pageDescription')}
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title={t('dashboardInstructor.createQuestionBank.bankDetails')}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t('dashboardInstructor.createQuestionBank.title')} required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
          </FormField>
          <FormField label={t('dashboardInstructor.createQuestionBank.description')} hint={t('dashboardInstructor.createQuestionBank.optional')} className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </FormField>
          <FormField label={t('dashboardInstructor.createQuestionBank.category')} hint={t('dashboardInstructor.createQuestionBank.optional')}>
            <Select value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">{t('dashboardInstructor.createQuestionBank.noCategory')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label={t('dashboardInstructor.createQuestionBank.course')} hint={t('dashboardInstructor.createQuestionBank.courseHint')}>
            <Select value={form.course} onChange={(e) => update('course', e.target.value)}>
              <option value="">{t('dashboardInstructor.createQuestionBank.anyCourse')}</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </FormField>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/question-banks')}>{t('dashboardInstructor.createQuestionBank.cancel')}</Button>
        <Button type="button" loading={loading} disabled={loading} onClick={handleSubmit}>
          {loading ? t('dashboardInstructor.createQuestionBank.creating') : t('dashboardInstructor.createQuestionBank.createBank')}
        </Button>
      </div>
    </div>
  )
}
