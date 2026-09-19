import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '../../context/ConfirmContext'
import { deleteRubric, getRubrics } from '../../services/rubricService'
import DataTable from '../../components/dashboard/DataTable'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { IconPlus, IconTrash } from '../../components/icons'

export default function RubricsList() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [rubrics, setRubrics] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    getRubrics({ page_size: 100 })
      .then((data) => setRubrics(data.results ?? data))
      .catch(() => setRubrics([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleDelete(rubric) {
    const { confirmed, reason } = await confirm(`Delete rubric "${rubric.title}"? Assignments using it will lose their rubric.`)
    if (!confirmed) return
    setBusyId(rubric.id)
    try {
      await deleteRubric(rubric.id, reason)
      load()
    } finally {
      setBusyId(null)
    }
  }

  const filteredRubrics = rubrics.filter((r) => {
    const term = search.trim().toLowerCase()
    return !term || r.title?.toLowerCase().includes(term)
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rubrics"
        description="Reusable scoring guides you can attach to any assignment."
        actions={<Button onClick={() => navigate('/dashboard/rubrics/create')}><IconPlus className="h-4 w-4" /> New Rubric</Button>}
      />

      <DataTable
        loading={loading}
        rows={filteredRubrics}
        emptyMessage="No rubrics yet. Create your first one."
        search={{ value: search, onChange: setSearch, placeholder: 'Search by title…' }}
        exportFilename="rubrics"
        exportTitle="Rubrics"
        columns={[
          { key: 'title', label: 'Title', render: (r) => <span className="font-semibold text-navy-900">{r.title}</span> },
          { key: 'criteria', label: 'Criteria', render: (r) => r.criteria?.length ?? 0 },
          { key: 'total_points', label: 'Total Points' },
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <div className="flex items-center justify-end gap-2">
                <button type="button" disabled={busyId === r.id} onClick={() => handleDelete(r)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete rubric">
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
