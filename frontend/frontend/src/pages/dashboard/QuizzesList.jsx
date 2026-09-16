import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { deleteQuiz, getQuizzes, publishQuiz } from '../../services/quizService'
import DataTable from '../../components/dashboard/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { IconEdit, IconPlus, IconTrash } from '../../components/icons'

const statusTone = { draft: 'warning', published: 'success', closed: 'neutral' }
const PAGE_SIZE = 20

export default function QuizzesList() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const [allQuizzes, setAllQuizzes] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const isManager = user?.user_type === 'admin' || user?.user_type === 'academic_manager'

  async function load() {
    setLoading(true)
    try {
      const data = await getQuizzes({ page_size: 200 })
      let rows = data.results ?? data
      if (!isManager) rows = rows.filter((q) => q.created_by === user?.id)
      setAllQuizzes(rows)
      setPage(1)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredQuizzes = allQuizzes.filter((q) => {
    if (status && q.status !== status) return false
    const term = search.trim().toLowerCase()
    return !term || q.title?.toLowerCase().includes(term)
  })
  useEffect(() => { setPage(1) }, [search, status])
  const quizzes = filteredQuizzes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handlePublish(id) {
    setBusyId(id)
    try {
      await publishQuiz(id)
      await load()
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(quiz) {
    const { confirmed, reason } = await confirm(`Delete quiz "${quiz.title}"? This cannot be undone.`)
    if (!confirmed) return
    setBusyId(quiz.id)
    try {
      await deleteQuiz(quiz.id, reason)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quizzes"
        description={`${allQuizzes.length} quiz${allQuizzes.length === 1 ? '' : 'zes'}`}
        actions={<Button as={Link} to="/dashboard/quizzes/create"><IconPlus className="h-4 w-4" /> Create Quiz</Button>}
      />

      <DataTable
        loading={loading}
        rows={quizzes}
        page={page}
        total={filteredQuizzes.length}
        onPageChange={setPage}
        emptyMessage="No quizzes yet. Create your first one."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by title…' }}
        filters={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: 'All statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        ]}
        exportRows={filteredQuizzes}
        exportFilename="quizzes"
        exportTitle="Quizzes"
        columns={[
          { key: 'title', label: 'Title', render: (q) => <span className="font-semibold text-navy-900">{q.title}</span> },
          { key: 'question_count', label: 'Questions' },
          { key: 'attempt_limit', label: 'Max Attempts' },
          { key: 'passing_marks', label: 'Passing', render: (q) => `${q.passing_marks}/${q.total_marks}` },
          { key: 'status', label: 'Status', render: (q) => <Badge tone={statusTone[q.status]}>{q.status}</Badge>, exportValue: (q) => q.status },
          {
            key: 'actions',
            label: '',
            render: (q) => (
              <div className="flex items-center justify-end gap-2">
                {q.status === 'draft' && (
                  <Button size="sm" variant="secondary" disabled={busyId === q.id} onClick={() => handlePublish(q.id)}>
                    Publish
                  </Button>
                )}
                <Link to={`/dashboard/quizzes/${q.id}/edit`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Edit quiz">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === q.id} onClick={() => handleDelete(q)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete quiz">
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
