import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfirm } from '../../../context/ConfirmContext'
import { deleteQuestionBank, getQuestionBanks } from '../../../services/questionBankService'
import DataTable from '../../../components/dashboard/DataTable'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import { IconEdit, IconPlus, IconTrash } from '../../../components/icons'

export default function QuestionBanksList() {
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
    const { confirmed, reason } = await confirm(`Delete question bank "${bank.title}"? This cannot be undone.`)
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
        title="Question Banks"
        description="Reusable questions you can pull into any quiz."
        actions={<Button as={Link} to="/dashboard/question-banks/create"><IconPlus className="h-4 w-4" /> New Bank</Button>}
      />

      <DataTable
        loading={loading}
        rows={banks}
        emptyMessage="No question banks yet. Create your first one."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by title…' }}
        exportFilename="question-banks"
        exportTitle="Question Banks"
        columns={[
          { key: 'title', label: 'Title', render: (b) => <span className="font-semibold text-navy-900">{b.title}</span> },
          { key: 'category_name', label: 'Category', render: (b) => b.category_name ?? '—' },
          { key: 'course_title', label: 'Course', render: (b) => b.course_title ?? '—' },
          { key: 'question_count', label: 'Questions' },
          {
            key: 'actions',
            label: '',
            render: (b) => (
              <div className="flex items-center justify-end gap-2">
                <Link to={`/dashboard/question-banks/${b.id}`} className="rounded-lg p-1.5 text-navy-700/50 hover:bg-navy-50" aria-label="Manage questions">
                  <IconEdit className="h-4 w-4" />
                </Link>
                <button type="button" disabled={busyId === b.id} onClick={() => handleDelete(b)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete bank">
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
