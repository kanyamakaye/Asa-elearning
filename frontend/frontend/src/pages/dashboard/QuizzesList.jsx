import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useLanguage } from '../../context/LanguageContext'
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
  const { t } = useLanguage()
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
    const { confirmed, reason } = await confirm(t('dashboardStudent.quizzesList.confirmDelete', { title: quiz.title }))
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
        title={t('dashboardStudent.quizzesList.heading')}
        description={t('dashboardStudent.quizzesList.quizCount', { count: allQuizzes.length })}
        actions={<Button as={Link} to="/dashboard/quizzes/create"><IconPlus className="h-4 w-4" /> {t('dashboardStudent.quizzesList.createQuiz')}</Button>}
      />

      <DataTable
        loading={loading}
        rows={quizzes}
        page={page}
        total={filteredQuizzes.length}
        onPageChange={setPage}
        emptyMessage={t('dashboardStudent.quizzesList.emptyMessage')}
        search={{ value: search, onChange: setSearch, placeholder: t('dashboardStudent.quizzesList.searchPlaceholder') }}
        filters={[
          {
            label: t('dashboardStudent.quizzesList.status'),
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: t('dashboardStudent.quizzesList.allStatuses') },
              { value: 'draft', label: t('dashboardStudent.quizzesList.draft') },
              { value: 'published', label: t('dashboardStudent.quizzesList.published') },
              { value: 'closed', label: t('dashboardStudent.quizzesList.closed') },
            ],
          },
        ]}
        exportRows={filteredQuizzes}
        exportFilename="quizzes"
        exportTitle={t('dashboardStudent.quizzesList.heading')}
        columns={[
          { key: 'title', label: t('dashboardStudent.quizzesList.columnTitle'), render: (q) => <span className="font-semibold text-navy-900 dark:text-white">{q.title}</span> },
          { key: 'question_count', label: t('dashboardStudent.quizzesList.columnQuestions') },
          { key: 'attempt_limit', label: t('dashboardStudent.quizzesList.columnMaxAttempts') },
          { key: 'passing_marks', label: t('dashboardStudent.quizzesList.columnPassing'), render: (q) => `${q.passing_marks}/${q.total_marks}` },
          { key: 'status', label: t('dashboardStudent.quizzesList.status'), render: (q) => <Badge tone={statusTone[q.status]}>{q.status}</Badge>, exportValue: (q) => q.status },
          {
            key: 'actions',
            label: '',
            render: (q) => (
              <div className="flex items-center justify-end gap-2">
                {q.status === 'draft' && (
                  <Button size="sm" variant="secondary" disabled={busyId === q.id} onClick={() => handlePublish(q.id)}>
                    {t('dashboardStudent.quizzesList.publish')}
                  </Button>
                )}
                <Link to={`/dashboard/quizzes/${q.id}/edit`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardStudent.quizzesList.editQuiz')}>
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === q.id} onClick={() => handleDelete(q)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" aria-label={t('dashboardStudent.quizzesList.deleteQuiz')}>
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
