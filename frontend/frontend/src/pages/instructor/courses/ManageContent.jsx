import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourse } from '../../../services/courseService'
import { getModules, createModule, updateModule, deleteModule } from '../../../services/moduleService'
import { getLessons, createLesson, updateLesson, deleteLesson } from '../../../services/lessonService'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
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
import { IconArrowDown, IconArrowUp, IconChevronDown, IconClipboard, IconEdit, IconPlay, IconPlus, IconTrash } from '../../../components/icons'

const LESSON_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
  { value: 'audio', label: 'Audio' },
  { value: 'pdf', label: 'PDF' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'live_session', label: 'Live Session' },
  { value: 'external_link', label: 'External Link' },
]

const EMPTY_MODULE = { title: '', description: '', status: 'active' }
const EMPTY_LESSON = {
  title: '', description: '', lesson_type: 'video', content: '', content_url: '',
  video_url: '', duration_minutes: '', is_preview: false, status: 'draft',
}

function ModuleForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title.trim()) return setError('Module title is required.')
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
      <FormField label="Module Title" required>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
      </FormField>
      <FormField label="Description">
        <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </FormField>
      <FormField label="Status">
        <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="hidden">Hidden</option>
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save Module'}</Button>
      </div>
    </div>
  )
}

function LessonForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title.trim()) return setError('Lesson title is required.')
    if (form.lesson_type === 'video' && !form.video_url.trim()) return setError('A video URL is required for video lessons.')
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Lesson Title" required className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
        </FormField>
        <FormField label="Type">
          <Select value={form.lesson_type} onChange={(e) => setForm((f) => ({ ...f, lesson_type: e.target.value }))}>
            {LESSON_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </FormField>
        <FormField label="Duration (minutes)">
          <Input type="number" min="0" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </FormField>
      {form.lesson_type === 'video' ? (
        <FormField label="Video URL" required>
          <Input value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} placeholder="https://" />
        </FormField>
      ) : form.lesson_type === 'external_link' ? (
        <FormField label="Content URL">
          <Input value={form.content_url} onChange={(e) => setForm((f) => ({ ...f, content_url: e.target.value }))} placeholder="https://" />
        </FormField>
      ) : (
        <FormField label="Content">
          <Textarea rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
        </FormField>
      )}
      <div className="flex items-center justify-between">
        <Checkbox label="Free preview (visible without enrollment)" checked={form.is_preview} onChange={(e) => setForm((f) => ({ ...f, is_preview: e.target.checked }))} />
        <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-40">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </Select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save Lesson'}</Button>
      </div>
    </div>
  )
}

export default function ManageContent() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [moduleModal, setModuleModal] = useState(null) // { mode: 'create'|'edit', module? }
  const [lessonModal, setLessonModal] = useState(null) // { mode, moduleId, lesson? }

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const courseData = await getCourse(slug)
      setCourse(courseData)
      const moduleData = await getModules(courseData.id)
      const moduleList = moduleData.results ?? moduleData
      const withLessons = await Promise.all(
        moduleList.map(async (m) => {
          const lessonData = await getLessons(m.id)
          return { ...m, lessons: lessonData.results ?? lessonData }
        })
      )
      setModules(withLessons)
      setExpanded((prev) => {
        const next = { ...prev }
        withLessons.forEach((m) => { if (!(m.id in next)) next[m.id] = true })
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(moduleId) {
    setExpanded((e) => ({ ...e, [moduleId]: !e[moduleId] }))
  }

  async function saveModule(form) {
    setSaving(true)
    try {
      if (moduleModal.mode === 'create') {
        await createModule({ ...form, course: course.id, order: modules.length + 1 })
      } else {
        await updateModule(moduleModal.module.id, form)
      }
      setModuleModal(null)
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  async function removeModule(m) {
    if (!window.confirm(`Delete module "${m.title}" and all its lessons?`)) return
    await deleteModule(m.id)
    await loadAll()
  }

  async function moveModule(m, delta) {
    const sorted = [...modules].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.id === m.id)
    const j = idx + delta
    if (j < 0 || j >= sorted.length) return
    const other = sorted[j]
    await Promise.all([updateModule(m.id, { order: other.order }), updateModule(other.id, { order: m.order })])
    await loadAll()
  }

  async function saveLesson(form) {
    setSaving(true)
    try {
      // DRF's IntegerField rejects an empty string outright (unlike a
      // missing key) — normalize the blank case to the model's own default.
      const payload = { ...form, duration_minutes: form.duration_minutes === '' ? 0 : form.duration_minutes }
      if (lessonModal.mode === 'create') {
        const module = modules.find((m) => m.id === lessonModal.moduleId)
        await createLesson({ ...payload, module: lessonModal.moduleId, order: (module?.lessons.length ?? 0) + 1 })
      } else {
        await updateLesson(lessonModal.lesson.id, payload)
      }
      setLessonModal(null)
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  async function removeLesson(lesson) {
    if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return
    await deleteLesson(lesson.id)
    await loadAll()
  }

  async function moveLesson(module, lesson, delta) {
    const sorted = [...module.lessons].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.id === lesson.id)
    const j = idx + delta
    if (j < 0 || j >= sorted.length) return
    const other = sorted[j]
    await Promise.all([updateLesson(lesson.id, { order: other.order }), updateLesson(other.id, { order: lesson.order })])
    await loadAll()
  }

  if (loading) return <LoadingSpinner label="Loading course content…" />

  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Courses', to: '/dashboard/courses' }, { label: 'Content' }]} />}
        title={course?.title}
        description="Organize your course into modules and lessons (submodules)."
        actions={<Button onClick={() => setModuleModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Add Module</Button>}
      />

      {modules.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8">
          <IconClipboard className="mx-auto h-8 w-8 text-navy-700/25" />
          <p className="mt-3 text-sm text-navy-700/50">No modules yet. Add your first module to start structuring this course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...modules].sort((a, b) => a.order - b.order).map((m, mi, arr) => (
            <div key={m.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8">
              <div className="flex items-center gap-3 px-5 py-4">
                <button type="button" onClick={() => toggle(m.id)} className="flex flex-1 items-center gap-3 text-left">
                  <IconChevronDown className={`h-4 w-4 shrink-0 text-navy-700/40 transition-transform ${expanded[m.id] ? '' : '-rotate-90'}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-900">Module {mi + 1}: {m.title}</p>
                    <p className="mt-0.5 text-xs text-navy-700/45">{m.lessons.length} lesson{m.lessons.length === 1 ? '' : 's'}</p>
                  </div>
                </button>
                <Badge tone={m.status === 'active' ? 'success' : m.status === 'hidden' ? 'danger' : 'neutral'}>{m.status}</Badge>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={mi === 0} onClick={() => moveModule(m, -1)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30" aria-label="Move up"><IconArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={mi === arr.length - 1} onClick={() => moveModule(m, 1)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30" aria-label="Move down"><IconArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setModuleModal({ mode: 'edit', module: m })} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit module"><IconEdit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => removeModule(m)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete module"><IconTrash className="h-4 w-4" /></button>
                </div>
              </div>

              {expanded[m.id] && (
                <div className="border-t border-navy-900/6 bg-navy-50/40 px-5 py-4">
                  {m.lessons.length === 0 ? (
                    <p className="text-xs text-navy-700/45">No lessons in this module yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {[...m.lessons].sort((a, b) => a.order - b.order).map((l, li, larr) => (
                        <li key={l.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-navy-900/6">
                          <IconPlay className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-navy-900">{li + 1}. {l.title}</p>
                            <p className="text-[11px] uppercase tracking-wide text-navy-700/40">{l.lesson_type.replace('_', ' ')} · {l.duration_minutes || 0} min{l.is_preview ? ' · Preview' : ''}</p>
                          </div>
                          <Badge tone={l.status === 'published' ? 'success' : l.status === 'hidden' ? 'danger' : 'neutral'}>{l.status}</Badge>
                          <div className="flex items-center gap-0.5">
                            <button type="button" disabled={li === 0} onClick={() => moveLesson(m, l, -1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30" aria-label="Move up"><IconArrowUp className="h-3.5 w-3.5" /></button>
                            <button type="button" disabled={li === larr.length - 1} onClick={() => moveLesson(m, l, 1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30" aria-label="Move down"><IconArrowDown className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => setLessonModal({ mode: 'edit', moduleId: m.id, lesson: l })} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50" aria-label="Edit lesson"><IconEdit className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => removeLesson(l)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete lesson"><IconTrash className="h-3.5 w-3.5" /></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button variant="secondary" size="sm" className="mt-3" onClick={() => setLessonModal({ mode: 'create', moduleId: m.id })}>
                    <IconPlus className="h-3.5 w-3.5" /> Add Lesson
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!moduleModal} onClose={() => setModuleModal(null)} title={moduleModal?.mode === 'create' ? 'Add Module' : 'Edit Module'}>
        {moduleModal && (
          <ModuleForm
            initial={moduleModal.mode === 'edit' ? { title: moduleModal.module.title, description: moduleModal.module.description, status: moduleModal.module.status } : EMPTY_MODULE}
            onSave={saveModule}
            onCancel={() => setModuleModal(null)}
            saving={saving}
          />
        )}
      </Modal>

      <Modal open={!!lessonModal} onClose={() => setLessonModal(null)} title={lessonModal?.mode === 'create' ? 'Add Lesson' : 'Edit Lesson'} size="lg">
        {lessonModal && (
          <LessonForm
            initial={
              lessonModal.mode === 'edit'
                ? {
                    title: lessonModal.lesson.title, description: lessonModal.lesson.description,
                    lesson_type: lessonModal.lesson.lesson_type, content: lessonModal.lesson.content,
                    content_url: lessonModal.lesson.content_url, video_url: lessonModal.lesson.video_url,
                    duration_minutes: lessonModal.lesson.duration_minutes, is_preview: lessonModal.lesson.is_preview,
                    status: lessonModal.lesson.status,
                  }
                : EMPTY_LESSON
            }
            onSave={saveLesson}
            onCancel={() => setLessonModal(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  )
}
