import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { createCourse, getCourse, getCourses, getCategories, publishCourse, updateCourse } from '../../../services/courseService'
import useCurrency from '../../../hooks/useCurrency'
import useUnsavedChanges from '../../../hooks/useUnsavedChanges'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import FileUpload from '../../../components/ui/FileUpload'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import { IconClose, IconPlus } from '../../../components/icons'

const STEP_KEYS = ['basicInfo', 'description', 'media', 'pricing', 'objectives', 'requirements', 'review']

const INITIAL_FORM = {
  title: '',
  course_code: '',
  category_id: '',
  level: 'beginner',
  language: 'English',
  short_description: '',
  description: '',
  thumbnail: null,
  thumbnail_url: '',
  price: '0',
  discount_price: '',
  duration_hours: '',
  visibility: 'public',
  learning_objectives: [],
  requirements: [],
  prerequisite: '',
  sequential_progression: false,
  certificate_validity_months: '',
}

function TagListEditor({ items, onChange, placeholder }) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState('')

  function add() {
    const value = draft.trim()
    if (!value) return
    onChange([...items, value])
    setDraft('')
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={add}>
          <IconPlus className="h-4 w-4" /> {t('dashboardInstructor.createCourse.add')}
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-navy-50 px-3.5 py-2 text-sm text-navy-800 dark:bg-white/5 dark:text-navy-100">
              <span className="min-w-0 flex-1 truncate">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="shrink-0 text-navy-700/40 hover:text-red-600 dark:text-navy-100/40 dark:hover:text-red-400"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function toFormShape(course) {
  return {
    title: course.title,
    course_code: course.course_code,
    category_id: course.category?.id ?? '',
    level: course.level,
    language: course.language,
    short_description: course.short_description,
    description: course.description,
    thumbnail: course.thumbnail ?? null,
    thumbnail_url: course.thumbnail_url ?? '',
    price: String(course.price ?? '0'),
    discount_price: course.discount_price != null ? String(course.discount_price) : '',
    duration_hours: String(course.duration_hours ?? ''),
    visibility: course.visibility,
    learning_objectives: course.learning_objectives ?? [],
    requirements: course.requirements ?? [],
    prerequisite: course.prerequisite ?? '',
    sequential_progression: course.sequential_progression ?? false,
    certificate_validity_months: course.certificate_validity_months ?? '',
  }
}

export default function CreateCourse() {
  const { t } = useLanguage()
  const formatCurrency = useCurrency()
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEdit = Boolean(slug)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [categories, setCategories] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM), [form])
  useUnsavedChanges(dirty && !success)

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {})
    getCourses({ page_size: 200 })
      .then((data) => setAllCourses(data.results ?? data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    getCourse(slug).then((course) => !cancelled && setForm(toFormShape(course)))
      .catch((err) => !cancelled && setSubmitError(err.message))
      .finally(() => !cancelled && setInitialLoading(false))
    return () => { cancelled = true }
  }, [slug, isEdit])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validateStep(index) {
    const next = {}
    if (index === 0) {
      if (form.title.trim().length < 3) next.title = t('dashboardInstructor.createCourse.errors.titleMinLength')
      if (!form.course_code.trim()) next.course_code = t('dashboardInstructor.createCourse.errors.required')
      if (!form.category_id) next.category_id = t('dashboardInstructor.createCourse.errors.required')
    }
    if (index === 1) {
      if (!form.short_description.trim()) next.short_description = t('dashboardInstructor.createCourse.errors.required')
      if (!form.description.trim()) next.description = t('dashboardInstructor.createCourse.errors.required')
    }
    if (index === 3) {
      if (form.price === '' || Number(form.price) < 0) next.price = t('dashboardInstructor.createCourse.errors.priceMin')
      if (form.discount_price && Number(form.discount_price) > Number(form.price)) {
        next.discount_price = t('dashboardInstructor.createCourse.errors.discountExceedsPrice')
      }
      if (!form.duration_hours || Number(form.duration_hours) <= 0) next.duration_hours = t('dashboardInstructor.createCourse.errors.greaterThanZero')
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
    for (let i = 0; i < STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }
    setLoading(true)
    setSubmitError('')
    try {
      const payload = {
        title: form.title,
        course_code: form.course_code,
        category_id: form.category_id,
        level: form.level,
        language: form.language,
        short_description: form.short_description,
        description: form.description,
        price: form.price || 0,
        discount_price: form.discount_price || undefined,
        duration_hours: form.duration_hours,
        visibility: form.visibility,
        learning_objectives: form.learning_objectives,
        requirements: form.requirements,
        prerequisite: form.prerequisite || null,
        sequential_progression: form.sequential_progression,
        certificate_validity_months: form.certificate_validity_months || null,
        thumbnail: form.thumbnail ?? undefined,
        thumbnail_url: form.thumbnail_url.trim(),
      }
      const resultSlug = isEdit ? slug : (await createCourse(payload)).data.slug
      if (isEdit) await updateCourse(slug, payload)
      if (publish) await publishCourse(resultSlug)
      setSuccess(true)
      // No standalone course-detail route exists yet — land back on the
      // courses list (matches CourseCard's own "Manage" link expectations).
      setTimeout(() => navigate('/dashboard/courses'), 1200)
    } catch (err) {
      setSubmitError(err.message)
      if (err.errors) setErrors((e) => ({ ...e, ...err.errors }))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <LoadingSpinner label={t('dashboardInstructor.createCourse.loadingCourse')} />

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title={isEdit ? t('dashboardInstructor.createCourse.updatedSuccess') : t('dashboardInstructor.createCourse.createdSuccess')}>
          {t('dashboardInstructor.createCourse.redirecting')}
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: t('dashboardInstructor.createCourse.breadcrumbDashboard'), to: '/dashboard' }, { label: t('dashboardInstructor.createCourse.breadcrumbCourses'), to: '/dashboard/courses' }, { label: isEdit ? t('dashboardInstructor.createCourse.editTitle') : t('dashboardInstructor.createCourse.createBreadcrumb') }]} />}
        title={isEdit ? t('dashboardInstructor.createCourse.editTitle') : t('dashboardInstructor.createCourse.createHeading')}
        description={isEdit ? t('dashboardInstructor.createCourse.editDescription') : t('dashboardInstructor.createCourse.createDescription')}
      />

      <div className="flex flex-wrap gap-2">
        {STEP_KEYS.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              i === step ? 'bg-navy-900 text-white dark:bg-brand-500' : i < step ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-navy-50 text-navy-700/60 dark:bg-white/5 dark:text-navy-100/60'
            }`}
          >
            {i + 1}. {t(`dashboardInstructor.createCourse.steps.${key}`)}
          </button>
        ))}
      </div>

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t('dashboardInstructor.createCourse.courseTitle')} required error={errors.title} className="sm:col-span-2">
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder={t('dashboardInstructor.createCourse.courseTitlePlaceholder')} error={errors.title} />
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.courseCode')} required error={errors.course_code}>
              <Input value={form.course_code} onChange={(e) => update('course_code', e.target.value)} placeholder={t('dashboardInstructor.createCourse.courseCodePlaceholder')} error={errors.course_code} />
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.category')} required error={errors.category_id}>
              <Select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} error={errors.category_id}>
                <option value="">{t('dashboardInstructor.createCourse.selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.level')} required>
              <Select value={form.level} onChange={(e) => update('level', e.target.value)}>
                <option value="beginner">{t('dashboardInstructor.createCourse.beginner')}</option>
                <option value="intermediate">{t('dashboardInstructor.createCourse.intermediate')}</option>
                <option value="advanced">{t('dashboardInstructor.createCourse.advanced')}</option>
              </Select>
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.language')} required>
              <Input value={form.language} onChange={(e) => update('language', e.target.value)} />
            </FormField>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <FormField label={t('dashboardInstructor.createCourse.shortDescription')} required error={errors.short_description}>
              <Textarea rows={2} value={form.short_description} onChange={(e) => update('short_description', e.target.value)} error={errors.short_description} />
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.fullDescription')} required error={errors.description}>
              <Textarea rows={8} value={form.description} onChange={(e) => update('description', e.target.value)} error={errors.description} />
            </FormField>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5">
            <FormField label={t('dashboardInstructor.createCourse.thumbnailUrl')} error={errors.thumbnail_url} hint={t('dashboardInstructor.createCourse.thumbnailUrlHint')}>
              <Input
                type="url"
                value={form.thumbnail_url}
                onChange={(e) => update('thumbnail_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                error={errors.thumbnail_url}
              />
            </FormField>
            {form.thumbnail_url.trim() && (
              <img
                src={form.thumbnail_url}
                alt={t('dashboardInstructor.createCourse.thumbnailPreviewAlt')}
                className="h-40 w-full rounded-xl object-cover ring-1 ring-navy-900/8 dark:ring-white/10"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
                onLoad={(e) => { e.currentTarget.style.display = 'block' }}
              />
            )}
            <FormField label={t('dashboardInstructor.createCourse.orUploadFile')} hint={t('dashboardInstructor.createCourse.uploadFileHint')}>
              <FileUpload
                label={t('dashboardInstructor.createCourse.uploadThumbnail')}
                accept="image/png,image/jpeg,image/webp"
                maxSizeMb={5}
                value={form.thumbnail}
                onChange={(file) => update('thumbnail', file)}
              />
            </FormField>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label={t('dashboardInstructor.createCourse.price')} required error={errors.price}>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} error={errors.price} />
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.discountPrice')} error={errors.discount_price} hint={t('dashboardInstructor.createCourse.optional')}>
              <Input type="number" min="0" step="0.01" value={form.discount_price} onChange={(e) => update('discount_price', e.target.value)} error={errors.discount_price} />
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.durationHours')} required error={errors.duration_hours}>
              <Input type="number" min="1" value={form.duration_hours} onChange={(e) => update('duration_hours', e.target.value)} error={errors.duration_hours} />
            </FormField>
          </div>
        )}

        {step === 4 && (
          <FormField label={t('dashboardInstructor.createCourse.learningObjectives')} hint={t('dashboardInstructor.createCourse.learningObjectivesHint')}>
            <TagListEditor items={form.learning_objectives} onChange={(v) => update('learning_objectives', v)} placeholder={t('dashboardInstructor.createCourse.objectivePlaceholder')} />
          </FormField>
        )}

        {step === 5 && (
          <div className="grid gap-5">
            <FormField label={t('dashboardInstructor.createCourse.requirements')} hint={t('dashboardInstructor.createCourse.requirementsHint')}>
              <TagListEditor items={form.requirements} onChange={(v) => update('requirements', v)} placeholder={t('dashboardInstructor.createCourse.requirementPlaceholder')} />
            </FormField>
            <FormField label={t('dashboardInstructor.createCourse.visibility')} required>
              <Select value={form.visibility} onChange={(e) => update('visibility', e.target.value)}>
                <option value="public">{t('dashboardInstructor.createCourse.public')}</option>
                <option value="private">{t('dashboardInstructor.createCourse.private')}</option>
              </Select>
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label={t('dashboardInstructor.createCourse.prerequisiteCourse')} error={errors.prerequisite} hint={t('dashboardInstructor.createCourse.prerequisiteHint')}>
                <Select value={form.prerequisite} onChange={(e) => update('prerequisite', e.target.value)} error={errors.prerequisite}>
                  <option value="">{t('dashboardInstructor.createCourse.none')}</option>
                  {allCourses.filter((c) => c.slug !== slug).map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label={t('dashboardInstructor.createCourse.certificateValidity')} hint={t('dashboardInstructor.createCourse.certificateValidityHint')}>
                <Input
                  type="number" min="1" value={form.certificate_validity_months}
                  onChange={(e) => update('certificate_validity_months', e.target.value)}
                />
              </FormField>
            </div>
            <Checkbox
              label={t('dashboardInstructor.createCourse.sequentialProgression')}
              checked={form.sequential_progression}
              onChange={(e) => update('sequential_progression', e.target.checked)}
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone="brand">{form.visibility}</Badge>
              <Badge tone="neutral">{form.level}</Badge>
            </div>
            <div>
              <p className="font-bold text-navy-900 dark:text-white">{form.title || t('dashboardInstructor.createCourse.untitledCourse')}</p>
              <p className="text-navy-700/60 dark:text-navy-100/60">{form.course_code}</p>
            </div>
            <p className="text-navy-700/70 dark:text-navy-100/70">{form.short_description}</p>
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-navy-50 p-4 sm:grid-cols-3 dark:bg-white/5">
              <div><p className="text-xs text-navy-700/50 dark:text-navy-100/50">{t('dashboardInstructor.createCourse.price')}</p><p className="font-semibold text-navy-900 dark:text-white">{formatCurrency(form.price)}</p></div>
              <div><p className="text-xs text-navy-700/50 dark:text-navy-100/50">{t('dashboardInstructor.createCourse.discountPrice')}</p><p className="font-semibold text-navy-900 dark:text-white">{form.discount_price ? formatCurrency(form.discount_price) : '—'}</p></div>
              <div><p className="text-xs text-navy-700/50 dark:text-navy-100/50">{t('dashboardInstructor.createCourse.durationHours')}</p><p className="font-semibold text-navy-900 dark:text-white">{t('dashboardInstructor.createCourse.hoursValue', { count: Number(form.duration_hours) || 0 })}</p></div>
            </div>
            <div>
              <p className="font-semibold text-navy-900 dark:text-white">{t('dashboardInstructor.createCourse.learningObjectives')}</p>
              <ul className="mt-1 list-inside list-disc text-navy-700/70 dark:text-navy-100/70">
                {form.learning_objectives.length === 0 ? <li>{t('dashboardInstructor.createCourse.noneAdded')}</li> : form.learning_objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-navy-900 dark:text-white">{t('dashboardInstructor.createCourse.requirements')}</p>
              <ul className="mt-1 list-inside list-disc text-navy-700/70 dark:text-navy-100/70">
                {form.requirements.length === 0 ? <li>{t('dashboardInstructor.createCourse.noneAdded')}</li> : form.requirements.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>{t('dashboardInstructor.createCourse.cancel')}</Button>
        <div className="flex gap-3">
          {step > 0 && <Button type="button" variant="outline" onClick={goBack}>{t('dashboardInstructor.createCourse.back')}</Button>}
          {step < STEP_KEYS.length - 1 && <Button type="button" onClick={goNext}>{t('dashboardInstructor.createCourse.next')}</Button>}
          {step === STEP_KEYS.length - 1 && (
            <>
              <Button type="button" variant="secondary" loading={loading} disabled={loading} onClick={() => handleSubmit(false)}>
                {loading ? (isEdit ? t('dashboardInstructor.createCourse.saving') : t('dashboardInstructor.createCourse.creating')) : isEdit ? t('dashboardInstructor.createCourse.saveChanges') : t('dashboardInstructor.createCourse.saveAsDraft')}
              </Button>
              <Button type="button" loading={loading} disabled={loading} onClick={() => handleSubmit(true)}>
                {loading ? (isEdit ? t('dashboardInstructor.createCourse.saving') : t('dashboardInstructor.createCourse.creating')) : isEdit ? t('dashboardInstructor.createCourse.saveAndPublish') : t('dashboardInstructor.createCourse.createButton')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
