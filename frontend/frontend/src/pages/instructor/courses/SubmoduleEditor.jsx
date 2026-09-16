import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getModule } from '../../../services/moduleService'
import { getLesson, createLesson, updateLesson } from '../../../services/lessonService'
import { getSections, createSection, updateSection, deleteSection } from '../../../services/sectionService'
import { useConfirm } from '../../../context/ConfirmContext'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import Alert from '../../../components/ui/Alert'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import { IconArrowDown, IconArrowUp, IconEdit, IconPlus, IconTrash } from '../../../components/icons'

const LESSON_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
  { value: 'audio', label: 'Audio' },
  { value: 'pdf', label: 'PDF' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'live_session', label: 'Live Session' },
  { value: 'external_link', label: 'External Link' },
]

const EMPTY_LESSON = {
  title: '', description: '', lesson_type: 'video', content: '', content_url: '',
  video_url: '', duration_minutes: '', is_preview: false, status: 'draft',
}
const EMPTY_SECTION = { title: '', content: '', video_url: '' }

function toFormShape(lesson) {
  return {
    title: lesson.title, description: lesson.description, lesson_type: lesson.lesson_type,
    content: lesson.content, content_url: lesson.content_url, video_url: lesson.video_url,
    duration_minutes: lesson.duration_minutes, is_preview: lesson.is_preview, status: lesson.status,
  }
}

function SectionForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title.trim()) return setError('Section title is required.')
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <FormField label="Section Title" required>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Overview" autoFocus />
      </FormField>
      <FormField label="Content">
        <Textarea rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
      </FormField>
      <FormField label="Video URL (optional)">
        <Input value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} placeholder="https://" />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save Section'}</Button>
      </div>
    </div>
  )
}

/** Full-page create/edit for a submodule (the platform's user-facing name
 * for a Lesson record) — was previously a cramped modal; a dedicated page
 * gives the content + settings fields room to breathe and lets sections be
 * managed right alongside the submodule that owns them. */
export default function SubmoduleEditor() {
  const { slug, moduleId, lessonId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const isEdit = Boolean(lessonId)

  const [module, setModule] = useState(null)
  const [form, setForm] = useState(EMPTY_LESSON)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sectionModal, setSectionModal] = useState(null) // { mode: 'create'|'edit', section? }
  const [sectionSaving, setSectionSaving] = useState(false)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(EMPTY_LESSON), [form])
  useUnsavedChanges(dirty && !success)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      getModule(moduleId),
      isEdit ? getLesson(lessonId) : Promise.resolve(null),
      isEdit ? getSections(lessonId) : Promise.resolve([]),
    ])
      .then(([moduleData, lessonData, sectionData]) => {
        if (cancelled) return
        setModule(moduleData)
        if (lessonData) setForm(toFormShape(lessonData))
        setSections(sectionData.results ?? sectionData)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [moduleId, lessonId, isEdit])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError('Submodule title is required.')
    if (form.lesson_type === 'video' && !form.video_url.trim()) return setError('A video URL is required for video submodules.')
    setError('')
    setSaving(true)
    try {
      // DRF's IntegerField rejects an empty string outright (unlike a
      // missing key) — normalize the blank case to the model's own default.
      const payload = { ...form, duration_minutes: form.duration_minutes === '' ? 0 : form.duration_minutes }
      if (isEdit) {
        await updateLesson(lessonId, payload)
        setSuccess(true)
        setTimeout(() => navigate(`/dashboard/courses/${slug}/content`), 900)
      } else {
        const created = await createLesson({ ...payload, module: moduleId, order: 999 })
        // Land on the new submodule's own edit page instead of back to the
        // outline, so sections can be added immediately without re-finding it.
        navigate(`/dashboard/courses/${slug}/content/modules/${moduleId}/submodules/${created.data.id}/edit`, { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveSection(sectionForm) {
    setSectionSaving(true)
    try {
      if (sectionModal.mode === 'create') {
        await createSection({ ...sectionForm, lesson: lessonId, order: sections.length + 1 })
      } else {
        await updateSection(sectionModal.section.id, sectionForm)
      }
      setSectionModal(null)
      const data = await getSections(lessonId)
      setSections(data.results ?? data)
    } finally {
      setSectionSaving(false)
    }
  }

  async function removeSection(section) {
    if (!(await confirm(`Delete section "${section.title}"?`))) return
    await deleteSection(section.id)
    const data = await getSections(lessonId)
    setSections(data.results ?? data)
  }

  async function moveSection(section, delta) {
    const sorted = [...sections].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.id === section.id)
    const j = idx + delta
    if (j < 0 || j >= sorted.length) return
    const other = sorted[j]
    await Promise.all([updateSection(section.id, { order: other.order }), updateSection(other.id, { order: section.order })])
    const data = await getSections(lessonId)
    setSections(data.results ?? data)
  }

  if (loading) return <LoadingSpinner label="Loading submodule…" />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Submodule saved successfully.">Redirecting…</Alert>
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
              { label: 'Courses', to: '/dashboard/courses' },
              { label: 'Content', to: `/dashboard/courses/${slug}/content` },
              { label: module?.title ?? 'Module' },
            ]}
          />
        }
        title={isEdit ? 'Edit Submodule' : 'Add Submodule'}
        description={module ? `In module: ${module.title}` : undefined}
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="text-sm font-bold text-navy-900">Basic Information</h2>
        <FormField label="Submodule Title" required>
          <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Introduction to Variables" autoFocus />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Type">
            <Select value={form.lesson_type} onChange={(e) => update('lesson_type', e.target.value)}>
              {LESSON_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Duration (minutes)">
            <Input type="number" min="0" value={form.duration_minutes} onChange={(e) => update('duration_minutes', e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Description" hint="A short summary shown above the content.">
          <Textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </FormField>
        <Checkbox label="Free preview (visible without enrollment)" checked={form.is_preview} onChange={(e) => update('is_preview', e.target.checked)} />
      </div>

      <div className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
        <h2 className="text-sm font-bold text-navy-900">Content</h2>
        {form.lesson_type === 'video' ? (
          <FormField label="Video URL" required hint="YouTube or Vimeo links are embedded automatically.">
            <Input value={form.video_url} onChange={(e) => update('video_url', e.target.value)} placeholder="https://" />
          </FormField>
        ) : form.lesson_type === 'external_link' ? (
          <FormField label="Content URL">
            <Input value={form.content_url} onChange={(e) => update('content_url', e.target.value)} placeholder="https://" />
          </FormField>
        ) : (
          <FormField label="Content">
            <Textarea rows={8} value={form.content} onChange={(e) => update('content', e.target.value)} />
          </FormField>
        )}
      </div>

      {isEdit && (
        <div className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Sections</h2>
            <p className="mt-1 text-xs text-navy-700/50">
              Optional — break this submodule into pages the student steps through one at a time.
            </p>
          </div>
          {sections.length === 0 ? (
            <p className="rounded-xl bg-navy-50 p-4 text-center text-xs text-navy-700/45">No sections yet.</p>
          ) : (
            <ul className="space-y-2">
              {[...sections].sort((a, b) => a.order - b.order).map((s, i, arr) => (
                <li key={s.id} className="flex items-center gap-2.5 rounded-xl bg-navy-50/60 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy-800">{i + 1}. {s.title}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={i === 0} onClick={() => moveSection(s, -1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-white disabled:opacity-30" aria-label="Move up"><IconArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" disabled={i === arr.length - 1} onClick={() => moveSection(s, 1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-white disabled:opacity-30" aria-label="Move down"><IconArrowDown className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => setSectionModal({ mode: 'edit', section: s })} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-white" aria-label="Edit section"><IconEdit className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => removeSection(s)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete section"><IconTrash className="h-3.5 w-3.5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button variant="secondary" size="sm" onClick={() => setSectionModal({ mode: 'create' })}>
            <IconPlus className="h-3.5 w-3.5" /> Add Section
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate(`/dashboard/courses/${slug}/content`)}>Cancel</Button>
        <Button type="button" loading={saving} disabled={saving} onClick={handleSubmit}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Submodule'}
        </Button>
      </div>

      <Modal open={!!sectionModal} onClose={() => setSectionModal(null)} title={sectionModal?.mode === 'create' ? 'Add Section' : 'Edit Section'}>
        {sectionModal && (
          <SectionForm
            initial={sectionModal.mode === 'edit' ? { title: sectionModal.section.title, content: sectionModal.section.content, video_url: sectionModal.section.video_url } : EMPTY_SECTION}
            onSave={saveSection}
            onCancel={() => setSectionModal(null)}
            saving={sectionSaving}
          />
        )}
      </Modal>
    </div>
  )
}
