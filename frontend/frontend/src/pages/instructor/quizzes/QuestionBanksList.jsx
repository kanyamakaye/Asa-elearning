import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfirm } from '../../../context/ConfirmContext'
import { useLanguage } from '../../../context/LanguageContext'
import { deleteQuestionBank, getQuestionBanks } from '../../../services/questionBankService'
import DataTable from '../../../components/dashboard/DataTable'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import { IconEdit, IconPlus, IconTrash } from '../../../components/icons'

export default function QuestionBanksList() {
  const { t } = useLanguage()
  const confirm = useConfirm()
  const [banks, setBanks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    getQuestionBanks({ page_size: 100, ...(search.trim() ? { search: search.trim() } : {}) })
      .then((data) => setBanks(data.results ?? data))
      .catch(() => setBanks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleDelete(bank) {
    const { confirmed, reason } = await confirm(t('dashboardInstructor.questionBanksList.confirmDelete', { title: bank.title }))
    if (!confirmed) return
    setBusyId(bank.id)
    try {
      await deleteQuestionBank(bank.id, reason)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('dashboardInstructor.questionBanksList.heading')}
        description={t('dashboardInstructor.questionBanksList.pageDescription')}
        actions={<Button as={Link} to="/dashboard/question-banks/create"><IconPlus className="h-4 w-4" /> {t('dashboardInstructor.questionBanksList.newBank')}</Button>}
      />

      <DataTable
        loading={loading}
        rows={banks}
        emptyMessage={t('dashboardInstructor.questionBanksList.noQuestionBanks')}
        search={{ value: search, onChange: setSearch, placeholder: t('dashboardInstructor.questionBanksList.searchPlaceholder') }}
        exportFilename="question-banks"
        exportTitle={t('dashboardInstructor.questionBanksList.heading')}
        columns={[
          { key: 'title', label: t('dashboardInstructor.questionBanksList.columnTitle'), render: (b) => <span className="font-semibold text-navy-900 dark:text-white">{b.title}</span> },
          { key: 'category_name', label: t('dashboardInstructor.questionBanksList.columnCategory'), render: (b) => b.category_name ?? '—' },
          { key: 'course_title', label: t('dashboardInstructor.questionBanksList.columnCourse'), render: (b) => b.course_title ?? '—' },
          { key: 'question_count', label: t('dashboardInstructor.questionBanksList.columnQuestions') },
          {
            key: 'actions',
            label: '',
            render: (b) => (
              <div className="flex items-center justify-end gap-2">
                <Link to={`/dashboard/question-banks/${b.id}`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50 dark:text-navy-100/50 dark:hover:bg-white/5" aria-label={t('dashboardInstructor.questionBanksList.manageQuestions')}>
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === b.id} onClick={() => handleDelete(b)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={t('dashboardInstructor.questionBanksList.deleteBank')}>
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
