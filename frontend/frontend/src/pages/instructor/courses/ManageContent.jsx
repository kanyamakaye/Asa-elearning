import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { getCourse } from '../../../services/courseService'
import { getUnits, createUnit, updateUnit, deleteUnit } from '../../../services/unitService'
import { getModules, createModule, updateModule, deleteModule } from '../../../services/moduleService'
import { getLessons, deleteLesson, updateLesson } from '../../../services/lessonService'
import { getSections } from '../../../services/sectionService'
import { useConfirm } from '../../../context/ConfirmContext'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
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
  const { t } = useLanguage()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title.trim()) return setError(t('dashboardInstructor.manageContent.lessonTitleRequired'))
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
      <FormField label={t('dashboardInstructor.manageContent.lessonTitle')} required>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t('dashboardInstructor.manageContent.lessonTitlePlaceholder')} autoFocus />
      </FormField>
      <FormField label={t('dashboardInstructor.manageContent.description')}>
        <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </FormField>
      <FormField label={t('dashboardInstructor.manageContent.status')}>
        <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          <option value="active">{t('dashboardInstructor.manageContent.active')}</option>
          <option value="inactive">{t('dashboardInstructor.manageContent.inactive')}</option>
          <option value="hidden">{t('dashboardInstructor.manageContent.hidden')}</option>
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t('dashboardInstructor.manageContent.cancel')}</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? t('dashboardInstructor.manageContent.saving') : t('dashboardInstructor.manageContent.saveLesson')}</Button>
      </div>
    </div>
  )
}

function ModuleForm({ initial, onSave, onCancel, saving }) {
  const { t } = useLanguage()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title.trim()) return setError(t('dashboardInstructor.manageContent.moduleTitleRequired'))
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
      <FormField label={t('dashboardInstructor.manageContent.moduleTitle')} required>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
      </FormField>
      <FormField label={t('dashboardInstructor.manageContent.description')}>
        <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </FormField>
      <FormField label={t('dashboardInstructor.manageContent.status')}>
        <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          <option value="active">{t('dashboardInstructor.manageContent.active')}</option>
          <option value="inactive">{t('dashboardInstructor.manageContent.inactive')}</option>
          <option value="hidden">{t('dashboardInstructor.manageContent.hidden')}</option>
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t('dashboardInstructor.manageContent.cancel')}</Button>
        <Button loading={saving} disabled={saving} onClick={submit}>{saving ? t('dashboardInstructor.manageContent.saving') : t('dashboardInstructor.manageContent.saveModule')}</Button>
      </div>
    </div>
  )
}

export default function ManageContent() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const confirm = useConfirm()
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
    const { confirmed, reason } = await confirm(t('dashboardInstructor.manageContent.confirmDeleteLesson', { title: u.title }))
    if (!confirmed) return
    await deleteUnit(u.id, reason)
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
    const { confirmed, reason } = await confirm(t('dashboardInstructor.manageContent.confirmDeleteModule', { title: m.title }))
    if (!confirmed) return
    await deleteModule(m.id, reason)
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
    const { confirmed, reason } = await confirm(t('dashboardInstructor.manageContent.confirmDeleteSubmodule', { title: lesson.title }))
    if (!confirmed) return
    await deleteLesson(lesson.id, reason)
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

  if (loading) return <LoadingSpinner label={t('dashboardInstructor.manageContent.loadingContent')} />

  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: t('dashboardInstructor.manageContent.breadcrumbDashboard'), to: '/dashboard' }, { label: t('dashboardInstructor.manageContent.breadcrumbCourses'), to: '/dashboard/courses' }, { label: t('dashboardInstructor.manageContent.breadcrumbContent') }]} />}
        title={course?.title}
        description={t('dashboardInstructor.manageContent.pageDescription')}
        actions={<Button onClick={() => setUnitModal({ mode: 'create' })}><IconPlus className="h-4 w-4" /> {t('dashboardInstructor.manageContent.addLesson')}</Button>}
      />

      {units.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <IconClipboard className="mx-auto h-8 w-8 text-navy-700/25 dark:text-navy-100/25" />
          <p className="mt-3 text-sm text-navy-700/50 dark:text-navy-100/50">{t('dashboardInstructor.manageContent.noLessonsYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...units].sort((a, b) => a.order - b.order).map((u, ui, uarr) => (
            <div key={u.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
              <div className="flex items-center gap-3 px-5 py-4">
                <button type="button" onClick={() => toggleUnit(u.id)} className="flex flex-1 items-center gap-3 text-left">
                  <IconChevronDown className={`h-4 w-4 shrink-0 text-navy-700/40 transition-transform dark:text-navy-100/40 ${expandedUnits[u.id] ? '' : '-rotate-90'}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-900 dark:text-white">{u.title}</p>
                    <p className="mt-0.5 text-xs text-navy-700/45 dark:text-navy-100/45">{t('dashboardInstructor.manageContent.moduleCount', { count: u.modules.length })}</p>
                  </div>
                </button>
                <Badge tone={u.status === 'active' ? 'success' : u.status === 'hidden' ? 'danger' : 'neutral'}>{u.status}</Badge>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={ui === 0} onClick={() => moveUnit(u, -1)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.moveUp')}><IconArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={ui === uarr.length - 1} onClick={() => moveUnit(u, 1)} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 disabled:opacity-30 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.moveDown')}><IconArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setUnitModal({ mode: 'edit', unit: u })} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.editLesson')}><IconEdit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => removeUnit(u)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={t('dashboardInstructor.manageContent.deleteLesson')}><IconTrash className="h-4 w-4" /></button>
                </div>
              </div>

              {expandedUnits[u.id] && (
                <div className="space-y-3 border-t border-navy-900/6 bg-navy-50/40 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                  {u.modules.length === 0 ? (
                    <p className="text-xs text-navy-700/45 dark:text-navy-100/45">{t('dashboardInstructor.manageContent.noModulesYet')}</p>
                  ) : (
                    [...u.modules].sort((a, b) => a.order - b.order).map((m, mi, marr) => (
                      <div key={m.id} className="overflow-hidden rounded-xl bg-white ring-1 ring-navy-900/6 dark:bg-navy-900 dark:ring-white/10">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <button type="button" onClick={() => toggleModule(m.id)} className="flex flex-1 items-center gap-3 text-left">
                            <IconChevronDown className={`h-3.5 w-3.5 shrink-0 text-navy-700/40 transition-transform dark:text-navy-100/40 ${expandedModules[m.id] ? '' : '-rotate-90'}`} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{t('dashboardInstructor.manageContent.moduleNumbered', { index: mi + 1, title: m.title })}</p>
                              <p className="mt-0.5 text-[11px] text-navy-700/45 dark:text-navy-100/45">{t('dashboardInstructor.manageContent.submoduleCount', { count: m.lessons.length })}</p>
                            </div>
                          </button>
                          <Badge tone={m.status === 'active' ? 'success' : m.status === 'hidden' ? 'danger' : 'neutral'}>{m.status}</Badge>
                          <div className="flex items-center gap-0.5">
                            <button type="button" disabled={mi === 0} onClick={() => moveModule(u, m, -1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30 dark:text-navy-100/40 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.moveUp')}><IconArrowUp className="h-3.5 w-3.5" /></button>
                            <button type="button" disabled={mi === marr.length - 1} onClick={() => moveModule(u, m, 1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30 dark:text-navy-100/40 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.moveDown')}><IconArrowDown className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => setModuleModal({ mode: 'edit', unitId: u.id, module: m })} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 dark:text-navy-100/40 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.editModule')}><IconEdit className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => removeModule(m)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={t('dashboardInstructor.manageContent.deleteModule')}><IconTrash className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>

                        {expandedModules[m.id] && (
                          <div className="border-t border-navy-900/6 bg-navy-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                            {m.lessons.length === 0 ? (
                              <p className="text-xs text-navy-700/45 dark:text-navy-100/45">{t('dashboardInstructor.manageContent.noSubmodulesYet')}</p>
                            ) : (
                              <ul className="space-y-2">
                                {[...m.lessons].sort((a, b) => a.order - b.order).map((l, li, larr) => (
                                  <li key={l.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-navy-900/6 dark:bg-navy-800 dark:ring-white/10">
                                    <IconPlay className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                                    <Link
                                      to={`/dashboard/courses/${slug}/content/modules/${m.id}/submodules/${l.id}/edit`}
                                      className="min-w-0 flex-1 hover:opacity-80"
                                    >
                                      <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{li + 1}. {l.title}</p>
                                      <p className="text-[11px] uppercase tracking-wide text-navy-700/40 dark:text-navy-100/40">
                                        {l.lesson_type.replace('_', ' ')} · {t('dashboardInstructor.manageContent.minutesValue', { count: l.duration_minutes || 0 })}{l.is_preview ? ` · ${t('dashboardInstructor.manageContent.preview')}` : ''}
                                        {l.sections?.length > 0 && ` · ${t('dashboardInstructor.manageContent.sectionCount', { count: l.sections.length })}`}
                                      </p>
                                    </Link>
                                    <Badge tone={l.status === 'published' ? 'success' : l.status === 'hidden' ? 'danger' : 'neutral'}>{l.status}</Badge>
                                    <div className="flex items-center gap-0.5">
                                      <button type="button" disabled={li === 0} onClick={() => moveLesson(m, l, -1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30 dark:text-navy-100/40 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.moveUp')}><IconArrowUp className="h-3.5 w-3.5" /></button>
                                      <button type="button" disabled={li === larr.length - 1} onClick={() => moveLesson(m, l, 1)} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 disabled:opacity-30 dark:text-navy-100/40 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.moveDown')}><IconArrowDown className="h-3.5 w-3.5" /></button>
                                      <Link to={`/dashboard/courses/${slug}/content/modules/${m.id}/submodules/${l.id}/edit`} className="rounded-lg p-1.5 text-navy-700/40 hover:bg-navy-50 dark:text-navy-100/40 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.manageContent.editSubmodule')}><IconEdit className="h-3.5 w-3.5" /></Link>
                                      <button type="button" onClick={() => removeLesson(l)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={t('dashboardInstructor.manageContent.deleteSubmodule')}><IconTrash className="h-3.5 w-3.5" /></button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <Button as={Link} to={`/dashboard/courses/${slug}/content/modules/${m.id}/submodules/new`} variant="secondary" size="sm" className="mt-3">
                              <IconPlus className="h-3.5 w-3.5" /> {t('dashboardInstructor.manageContent.addSubmodule')}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setModuleModal({ mode: 'create', unitId: u.id })}>
                    <IconPlus className="h-3.5 w-3.5" /> {t('dashboardInstructor.manageContent.addModule')}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!unitModal} onClose={() => setUnitModal(null)} title={unitModal?.mode === 'create' ? t('dashboardInstructor.manageContent.addLesson') : t('dashboardInstructor.manageContent.editLesson')}>
        {unitModal && (
          <UnitForm
            initial={unitModal.mode === 'edit' ? { title: unitModal.unit.title, description: unitModal.unit.description, status: unitModal.unit.status } : EMPTY_UNIT}
            onSave={saveUnit}
            onCancel={() => setUnitModal(null)}
            saving={saving}
          />
        )}
      </Modal>

      <Modal open={!!moduleModal} onClose={() => setModuleModal(null)} title={moduleModal?.mode === 'create' ? t('dashboardInstructor.manageContent.addModule') : t('dashboardInstructor.manageContent.editModule')}>
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
