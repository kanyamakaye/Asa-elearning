import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { createAnnouncement, deleteAnnouncement, listAnnouncements } from '../../lib/dashboardApi'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { IconMegaphone, IconPlus, IconTrash } from '../../components/icons'

const audienceTone = { all: 'brand', students: 'success', instructors: 'warning', course: 'neutral' }
// Matches the backend's IsInstructorOrReadOnly gate on AnnouncementViewSet (admin/instructor only).
const MANAGER_ROLES = ['admin', 'instructor']

export default function AnnouncementsList() {
  const { accessToken, user } = useAuth()
  const confirm = useConfirm()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', audience_type: 'all' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await listAnnouncements(accessToken)
      setAnnouncements(data.results ?? data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createAnnouncement(form, accessToken)
      setModalOpen(false)
      setForm({ title: '', message: '', audience_type: 'all' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(a) {
    if (!(await confirm(`Delete announcement "${a.title}"?`))) return
    await deleteAnnouncement(a.id, accessToken)
    await load()
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Announcements"
        description={`${announcements.length} announcement${announcements.length === 1 ? '' : 's'}`}
        actions={canManage ? <Button onClick={() => setModalOpen(true)}><IconPlus className="h-4 w-4" /> New Announcement</Button> : null}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-900/8">
          <IconMegaphone className="mx-auto h-8 w-8 text-navy-700/25" />
          <p className="mt-3 text-sm text-navy-700/50">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-navy-900">{a.title}</h4>
                    <Badge tone={audienceTone[a.audience_type] ?? 'neutral'}>{a.audience_type}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-navy-700/70">{a.message}</p>
                  <p className="mt-2 text-xs text-navy-700/40">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                {canManage && (
                  <button type="button" onClick={() => remove(a)} className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete announcement">
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Announcement">
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <FormField label="Title" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
          </FormField>
          <FormField label="Message" required>
            <Textarea rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </FormField>
          <FormField label="Audience">
            <Select value={form.audience_type} onChange={(e) => setForm((f) => ({ ...f, audience_type: e.target.value }))}>
              <option value="all">All Users</option>
              <option value="students">Students</option>
              <option value="instructors">Instructors</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} disabled={saving} onClick={submit}>{saving ? 'Publishing…' : 'Publish Announcement'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
