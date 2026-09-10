import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createQuestionBank, deleteQuestionBank, getQuestionBanks } from '../../../services/questionBankService'
import { getCategories } from '../../../services/courseService'
import useCourseOptions from '../../../hooks/useCourseOptions'
import DataTable from '../../../components/dashboard/DataTable'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import { IconEdit, IconPlus, IconTrash } from '../../../components/icons'

const EMPTY_FORM = { title: '', description: '', category: '', course: '' }

export default function QuestionBanksList() {
  const { courses } = useCourseOptions()
  const [categories, setCategories] = useState([])
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    getQuestionBanks({ page_size: 100 })
      .then((data) => setBanks(data.results ?? data))
      .catch(() => setBanks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    getCategories().then((data) => setCategories(data.results ?? data)).catch(() => {})
  }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  async function handleCreate() {
    if (form.title.trim().length < 3) {
      setError('Title must be at least 3 characters long.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createQuestionBank({
        title: form.title,
        description: form.description,
        category: form.category || null,
        course: form.course || null,
      })
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.message || 'Could not create this question bank.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(bank) {
    if (!window.confirm(`Delete question bank "${bank.title}"? This cannot be undone.`)) return
    setBusyId(bank.id)
    try {
      await deleteQuestionBank(bank.id)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Question Banks"
        description="Reusable questions you can pull into any quiz."
        actions={<Button onClick={openCreate}><IconPlus className="h-4 w-4" /> New Bank</Button>}
      />

      <DataTable
        loading={loading}
        rows={banks}
        emptyMessage="No question banks yet. Create your first one."
        columns={[
          { key: 'title', label: 'Title', render: (b) => <span className="font-semibold text-navy-900">{b.title}</span> },
          { key: 'category_name', label: 'Category', render: (b) => b.category_name ?? '—' },
          { key: 'course_title', label: 'Course', render: (b) => b.course_title ?? '—' },
          { key: 'question_count', label: 'Questions' },
          {
            key: 'actions',
            label: '',
            render: (b) => (
              <div className="flex items-center justify-end gap-2">
                <Link to={`/dashboard/question-banks/${b.id}`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Manage questions">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === b.id} onClick={() => handleDelete(b)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete bank">
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Question Bank"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="button" loading={saving} disabled={saving} onClick={handleCreate}>Create Bank</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          <FormField label="Title" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Description" hint="Optional">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>
          <FormField label="Category" hint="Optional">
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Course" hint="Optional — scope this bank to one course">
            <Select value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
              <option value="">Any course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
