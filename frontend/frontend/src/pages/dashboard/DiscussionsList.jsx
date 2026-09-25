import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useLanguage } from '../../context/LanguageContext'
import { createDiscussionTopic, deleteDiscussionTopic, listDiscussionTopics } from '../../lib/dashboardApi'
import useCourseOptions from '../../hooks/useCourseOptions'
import { exportTableToExcel, exportTableToPdf } from '../../lib/exportTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { IconArrowDown, IconChat, IconPlus, IconSearch, IconTrash } from '../../components/icons'

function getExportColumns(t) {
  return [
    { key: 'title', label: t('dashboardStudent.discussionsList.columnTitle') },
    { key: 'course', label: t('dashboardStudent.discussionsList.columnCourse') },
    { key: 'created_by', label: t('dashboardStudent.discussionsList.columnCreatedBy'), exportValue: (topic) => topic.created_by?.full_name ?? topic.created_by?.username ?? '' },
    { key: 'reply_count', label: t('dashboardStudent.discussionsList.columnReplies') },
    { key: 'status', label: t('dashboardStudent.discussionsList.columnStatus') },
    { key: 'created_at', label: t('dashboardStudent.discussionsList.columnCreated'), exportValue: (topic) => new Date(topic.created_at).toLocaleDateString() },
  ]
}

const MODERATOR_ROLES = ['admin', 'academic_manager', 'instructor', 'content_manager']

export default function DiscussionsList() {
  const { accessToken, user } = useAuth()
  const confirm = useConfirm()
  const { t } = useLanguage()
  const EXPORT_COLUMNS = getExportColumns(t)
  const { courses } = useCourseOptions()
  const [topics, setTopics] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ course: '', title: '', description: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await listDiscussionTopics(accessToken, search.trim() ? { search: search.trim() } : {})
      setTopics(data.results ?? data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, search])

  async function remove(topic) {
    const { confirmed, reason } = await confirm(t('dashboardStudent.discussionsList.confirmDelete', { title: topic.title }))
    if (!confirmed) return
    await deleteDiscussionTopic(topic.id, accessToken, reason)
    await load()
  }

  function canDelete(topic) {
    return topic.created_by?.id === user?.id || MODERATOR_ROLES.includes(user?.user_type)
  }

  async function submit() {
    if (!form.course || !form.title.trim()) {
      setError(t('dashboardStudent.discussionsList.courseAndTitleRequired'))
      return
    }
    setSaving(true)
    setError('')
    try {
      await createDiscussionTopic(form, accessToken)
      setModalOpen(false)
      setForm({ course: '', title: '', description: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('dashboardStudent.discussionsList.heading')}
        description={t('dashboardStudent.discussionsList.topicCount', { count: topics.length })}
        actions={<Button onClick={() => setModalOpen(true)}><IconPlus className="h-4 w-4" /> {t('dashboardStudent.discussionsList.newTopic')}</Button>}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('dashboardStudent.discussionsList.searchPlaceholder')}
            className="w-full rounded-lg border border-navy-900/10 bg-white py-2 pl-8 pr-3 text-xs text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => exportTableToExcel(topics, EXPORT_COLUMNS, 'discussions')}>
          <IconArrowDown className="h-3.5 w-3.5" /> {t('dashboardStudent.discussionsList.excel')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exportTableToPdf(topics, EXPORT_COLUMNS, 'discussions', t('dashboardStudent.discussionsList.heading'))}>
          <IconArrowDown className="h-3.5 w-3.5" /> {t('dashboardStudent.discussionsList.pdf')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10" />)}
        </div>
      ) : topics.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <IconChat className="mx-auto h-8 w-8 text-navy-700/25 dark:text-navy-100/25" />
          <p className="mt-3 text-sm text-navy-700/50 dark:text-navy-100/50">{t('dashboardStudent.discussionsList.empty')}</p>
        </div>
      ) : (
        <ul className="divide-y divide-navy-900/6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 dark:divide-white/10 dark:bg-navy-800 dark:ring-white/10">
          {topics.map((topic) => (
            <li key={topic.id} className="flex items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {topic.is_pinned && <Badge tone="warning">{t('dashboardStudent.discussionsList.pinned')}</Badge>}
                  <Link to={`/courses/${topic.course}`} className="truncate text-sm font-bold text-navy-900 hover:text-brand-500 dark:text-white dark:hover:text-brand-400">{topic.title}</Link>
                  {topic.status !== 'active' && <Badge tone="neutral">{topic.status}</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-navy-700/45 dark:text-navy-100/45">{t('dashboardStudent.discussionsList.byAuthor', { name: topic.created_by?.full_name ?? topic.created_by?.username })} · {new Date(topic.created_at).toLocaleDateString()}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-navy-700/50 dark:text-navy-100/50">{t('dashboardStudent.discussionsList.replyCount', { count: topic.reply_count })}</span>
              {canDelete(topic) && (
                <button type="button" onClick={() => remove(topic)} className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" aria-label={t('dashboardStudent.discussionsList.deleteTopic')}>
                  <IconTrash className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('dashboardStudent.discussionsList.newDiscussionTopic')}>
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <FormField label={t('dashboardStudent.discussionsList.course')} required>
            <Select value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
              <option value="">{t('dashboardStudent.discussionsList.selectCourse')}</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </FormField>
          <FormField label={t('dashboardStudent.discussionsList.titleLabel')} required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label={t('dashboardStudent.discussionsList.descriptionLabel')}>
            <Textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('dashboardStudent.discussionsList.cancel')}</Button>
            <Button loading={saving} disabled={saving} onClick={submit}>{saving ? t('dashboardStudent.discussionsList.posting') : t('dashboardStudent.discussionsList.postTopic')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
