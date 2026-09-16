import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    if (form.title.trim().length < 3) next.title = 'Must be at least 3 characters long.'
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
      setSubmitError(err.message || 'Could not create this question bank.')
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Question bank created successfully.">Redirecting…</Alert>
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
              { label: 'New Bank' },
            ]}
          />
        }
        title="New Question Bank"
        description="Create a reusable pool of questions you can pull into any quiz."
      />

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Card title="Bank Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Title" required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
          </FormField>
          <FormField label="Description" hint="Optional" className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </FormField>
          <FormField label="Category" hint="Optional">
            <Select value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Course" hint="Optional — scope this bank to one course">
            <Select value={form.course} onChange={(e) => update('course', e.target.value)}>
              <option value="">Any course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </FormField>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/question-banks')}>Cancel</Button>
        <Button type="button" loading={loading} disabled={loading} onClick={handleSubmit}>
          {loading ? 'Creating Bank…' : 'Create Bank'}
        </Button>
      </div>
    </div>
  )
}
