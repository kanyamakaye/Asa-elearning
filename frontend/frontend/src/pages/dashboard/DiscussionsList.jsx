import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createDiscussionTopic, deleteDiscussionTopic, listDiscussionTopics } from '../../lib/dashboardApi'
import useCourseOptions from '../../hooks/useCourseOptions'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { IconChat, IconPlus, IconTrash } from '../../components/icons'

const MODERATOR_ROLES = ['admin', 'academic_manager', 'instructor', 'content_manager']

export default function DiscussionsList() {
  const { accessToken, user } = useAuth()
  const { courses } = useCourseOptions()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ course: '', title: '', description: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await listDiscussionTopics(accessToken)
      setTopics(data.results ?? data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  async function remove(topic) {
    if (!window.confirm(`Delete discussion topic "${topic.title}"? This removes all its replies too.`)) return
    await deleteDiscussionTopic(topic.id, accessToken)
    await load()
  }

  function canDelete(topic) {
    return topic.created_by?.id === user?.id || MODERATOR_ROLES.includes(user?.user_type)
  }

  async function submit() {
    if (!form.course || !form.title.trim()) {
      setError('Course and title are required.')
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
        title="Discussions"
        description={`${topics.length} topic${topics.length === 1 ? '' : 's'}`}
        actions={<Button onClick={() => setModalOpen(true)}><IconPlus className="h-4 w-4" /> New Topic</Button>}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />)}
        </div>
      ) : topics.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8">
          <IconChat className="mx-auto h-8 w-8 text-navy-700/25" />
          <p className="mt-3 text-sm text-navy-700/50">No discussion topics yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-navy-900/6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8">
          {topics.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {t.is_pinned && <Badge tone="warning">Pinned</Badge>}
                  <Link to={`/courses/${t.course}`} className="truncate text-sm font-bold text-navy-900 hover:text-brand-500">{t.title}</Link>
                  {t.status !== 'active' && <Badge tone="neutral">{t.status}</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-navy-700/45">by {t.created_by?.full_name ?? t.created_by?.username} · {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-navy-700/50">{t.reply_count} repl{t.reply_count === 1 ? 'y' : 'ies'}</span>
              {canDelete(t) && (
                <button type="button" onClick={() => remove(t)} className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete topic">
                  <IconTrash className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Discussion Topic">
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <FormField label="Course" required>
            <Select value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Title" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Posting…' : 'Post Topic'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
