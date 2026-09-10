import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourse } from '../../../services/courseService'
import { getUnits, createUnit, updateUnit, deleteUnit } from '../../../services/unitService'
import { getModules, createModule, updateModule, deleteModule } from '../../../services/moduleService'
import { getLessons, deleteLesson, updateLesson } from '../../../services/lessonService'
import { getSections } from '../../../services/sectionService'
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

const EMPTY_UNIT = { title: '', description: '', status: 'active' }
const EMPTY_MODULE = { title: '', description: '', status: 'active' }

function UnitForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title.trim()) return setError('Lesson title is required.')
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
      <FormField label="Lesson Title" required>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Lesson 1: Web Development Fundamentals" autoFocus />
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
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save Lesson'}</Button>
      </div>
    </div>
  )
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

export default function ManageContent() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [units, setUnits] = useState([])
  const [expandedUnits, setExpandedUnits] = useState({})
  const [expandedModules, setExpandedModules] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [unitModal, setUnitModal] = useState(null) // { mode: 'create'|'edit', unit? }
  const [moduleModal, setModuleModal] = useState(null) // { mode, unitId, module? }

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const courseData = await getCourse(slug)
      setCourse(courseData)
      const unitData = await getUnits(courseData.id)
      const unitList = unitData.results ?? unitData
      const withModules = await Promise.all(
        unitList.map(async (u) => {
          const moduleData = await getModules(u.id)
          const moduleList = moduleData.results ?? moduleData
          const withLessons = await Promise.all(
            moduleList.map(async (m) => {
              const lessonData = await getLessons(m.id)
              const lessonList = lessonData.results ?? lessonData
              const withSections = await Promise.all(
                lessonList.map(async (l) => {
                  const sectionData = await getSections(l.id)
                  return { ...l, sections: sectionData.results ?? sectionData }
                })
              )
              return { ...m, lessons: withSections }
            })
          )
          return { ...u, modules: withLessons }
        })
      )
      setUnits(withModules)
      setExpandedUnits((prev) => {
        const next = { ...prev }
        withModules.forEach((u) => { if (!(u.id in next)) next[u.id] = true })
        return next
      })
      setExpandedModules((prev) => {
        const next = { ...prev }
        withModules.forEach((u) => u.modules.forEach((m) => { if (!(m.id in next)) next[m.id] = true }))
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleUnit(unitId) {
    setExpandedUnits((e) => ({ ...e, [unitId]: !e[unitId] }))
  }

  function toggleModule(moduleId) {
    setExpandedModules((e) => ({ ...e, [moduleId]: !e[moduleId] }))
  }

  async function saveUnit(form) {
    setSaving(true)
    try {
      if (unitModal.mode === 'create') {
        await createUnit({ ...form, course: course.id, order: units.length + 1 })
      } else {
        await updateUnit(unitModal.unit.id, form)
      }
      setUnitModal(null)
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  async function removeUnit(u) {
    if (!window.confirm(`Delete lesson "${u.title}" and everything inside it?`)) return
    await deleteUnit(u.id)
    await loadAll()
  }

  async function moveUnit(u, delta) {
    const sorted = [...units].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.id === u.id)
    const j = idx + delta
    if (j < 0 || j >= sorted.length) return
    const other = sorted[j]
    await Promise.all([updateUnit(u.id, { order: other.order }), updateUnit(other.id, { order: u.order })])
    await loadAll()
  }

  async function saveModule(form) {
    setSaving(true)
    try {
      if (moduleModal.mode === 'create') {
        const unit = units.find((u) => u.id === moduleModal.unitId)
        await createModule({ ...form, unit: moduleModal.unitId, order: (unit?.modules.length ?? 0) + 1 })
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
    if (!window.confirm(`Delete module "${m.title}" and all its submodules?`)) return
    await deleteModule(m.id)
    await loadAll()
  }

  async function moveModule(unit, m, delta) {
    const sorted = [...unit.modules].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.id === m.id)
    const j = idx + delta
    if (j < 0 || j >= sorted.length) return
    const other = sorted[j]
    await Promise.all([updateModule(m.id, { order: other.order }), updateModule(other.id, { order: m.order })])
    await loadAll()
  }

  async function removeLesson(lesson) {
    if (!window.confirm(`Delete submodule "${lesson.title}" and its sections?`)) return
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
        description="Organize your course into lessons, modules, and submodules."
        actions={<Button onClick={() => setUnitModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> Add Lesson</Button>}
      />

      {units.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8">
          <IconClipboard className="mx-auto h-8 w-8 text-navy-700/25" />
          <p className="mt-3 text-sm text-navy-700/50">No lessons yet. Add your first lesson to start structuring this course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...units].sort((a, b) => a.order - b.order).map((u, ui, uarr) => (
            <div key={u.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8">
              <div className="flex items-center gap-3 px-5 py-4">
                <button type="button" onClick={() => toggleUnit(u.id)} className="flex flex-1 items-center gap-3 text-left">
                  <IconChevronDown className={`h-4 w-4 shrink-0 text-navy-700/40 transition-transform ${expandedUnits[u.id] ? '' : '-rotate-90'}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-900">{u.title}</p>
                    <p className="mt-0.5 text-xs text-navy-700/45">{u.modules.length} module{u.modules.length === 1 ? '' : 's'}</p>
                  </div>
                </button>
                <Badge tone={u.status === 'active' ? 'success' : u.status === 'hidden' ? 'danger' : 'neutral'}>{u.status}</Badge>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={ui === 0} onClick={() => moveUnit(u, -1)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30" aria-label="Move up"><IconArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={ui === uarr.length - 1} onClick={() => moveUnit(u, 1)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30" aria-label="Move down"><IconArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setUnitModal({ mode: 'edit', unit: u })} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit lesson"><IconEdit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => removeUnit(u)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete lesson"><IconTrash className="h-4 w-4" /></button>
                </div>
              </div>

              {expandedUnits[u.id] && (
                <div className="space-y-3 border-t border-navy-900/6 bg-navy-50/40 px-5 py-4">
                  {u.modules.length === 0 ? (
                    <p className="text-xs text-navy-700/45">No modules in this lesson yet.</p>
                  ) : (
                    [...u.modules].sort((a, b) => a.order - b.order).map((m, mi, marr) => (
                      <div key={m.id} className="overflow-hidden rounded-xl bg-white ring-1 ring-navy-900/6">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <button type="button" onClick={() => toggleModule(m.id)} className="flex flex-1 items-center gap-3 text-left">
                            <IconChevronDown className={`h-3.5 w-3.5 shrink-0 text-navy-700/40 transition-transform ${expandedModules[m.id] ? '' : '-rotate-90'}`} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-navy-900">Module {mi + 1}: {m.title}</p>
                              <p className="mt-0.5 text-[11px] text-navy-700/45">{m.lessons.length} submodule{m.lessons.length === 1 ? '' : 's'}</p>
                            </div>
                          </button>
                          <Badge tone={m.status === 'active' ? 'success' : m.status === 'hidden' ? 'danger' : 'neutral'}>{m.status}</Badge>
                          <div className="flex items-center gap-0.5">
                            <button type="button" disabled={mi === 0} onClick={() => moveModule(u, m, -1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30" aria-label="Move up"><IconArrowUp className="h-3.5 w-3.5" /></button>
                            <button type="button" disabled={mi === marr.length - 1} onClick={() => moveModule(u, m, 1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30" aria-label="Move down"><IconArrowDown className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => setModuleModal({ mode: 'edit', unitId: u.id, module: m })} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50" aria-label="Edit module"><IconEdit className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => removeModule(m)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete module"><IconTrash className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>

                        {expandedModules[m.id] && (
                          <div className="border-t border-navy-900/6 bg-navy-50/60 px-4 py-3">
                            {m.lessons.length === 0 ? (
                              <p className="text-xs text-navy-700/45">No submodules in this module yet.</p>
                            ) : (
                              <ul className="space-y-2">
                                {[...m.lessons].sort((a, b) => a.order - b.order).map((l, li, larr) => (
                                  <li key={l.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-navy-900/6">
                                    <IconPlay className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                                    <Link
                                      to={`/dashboard/courses/${slug}/content/modules/${m.id}/submodules/${l.id}/edit`}
                                      className="min-w-0 flex-1 hover:opacity-80"
                                    >
                                      <p className="truncate text-sm font-semibold text-navy-900">{li + 1}. {l.title}</p>
                                      <p className="text-[11px] uppercase tracking-wide text-navy-700/40">
                                        {l.lesson_type.replace('_', ' ')} · {l.duration_minutes || 0} min{l.is_preview ? ' · Preview' : ''}
                                        {l.sections?.length > 0 && ` · ${l.sections.length} section${l.sections.length === 1 ? '' : 's'}`}
                                      </p>
                                    </Link>
                                    <Badge tone={l.status === 'published' ? 'success' : l.status === 'hidden' ? 'danger' : 'neutral'}>{l.status}</Badge>
                                    <div className="flex items-center gap-0.5">
                                      <button type="button" disabled={li === 0} onClick={() => moveLesson(m, l, -1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30" aria-label="Move up"><IconArrowUp className="h-3.5 w-3.5" /></button>
                                      <button type="button" disabled={li === larr.length - 1} onClick={() => moveLesson(m, l, 1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30" aria-label="Move down"><IconArrowDown className="h-3.5 w-3.5" /></button>
                                      <Link to={`/dashboard/courses/${slug}/content/modules/${m.id}/submodules/${l.id}/edit`} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50" aria-label="Edit submodule"><IconEdit className="h-3.5 w-3.5" /></Link>
                                      <button type="button" onClick={() => removeLesson(l)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete submodule"><IconTrash className="h-3.5 w-3.5" /></button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <Button as={Link} to={`/dashboard/courses/${slug}/content/modules/${m.id}/submodules/new`} variant="secondary" size="sm" className="mt-3">
                              <IconPlus className="h-3.5 w-3.5" /> Add Submodule
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setModuleModal({ mode: 'create', unitId: u.id })}>
                    <IconPlus className="h-3.5 w-3.5" /> Add Module
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!unitModal} onClose={() => setUnitModal(null)} title={unitModal?.mode === 'create' ? 'Add Lesson' : 'Edit Lesson'}>
        {unitModal && (
          <UnitForm
            initial={unitModal.mode === 'edit' ? { title: unitModal.unit.title, description: unitModal.unit.description, status: unitModal.unit.status } : EMPTY_UNIT}
            onSave={saveUnit}
            onCancel={() => setUnitModal(null)}
            saving={saving}
          />
        )}
      </Modal>

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

    </div>
  )
}
