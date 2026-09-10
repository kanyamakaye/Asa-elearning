import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../lib/api'
import { getMyTranscript } from '../../lib/queries'
import DataTable from '../../components/dashboard/DataTable'
import { IconArrowDown, IconAward } from '../../components/icons'

const STATUS_LABELS = {
  active: 'In Progress',
  completed: 'Completed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  suspended: 'Suspended',
}

const statusStyles = {
  active: 'bg-brand-50 text-brand-600',
  completed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  suspended: 'bg-navy-100 text-navy-700',
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-navy-900/8">
      <p className="text-2xl font-extrabold text-navy-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-navy-700/55">{label}</p>
    </div>
  )
}

export default function Transcript() {
  const { accessToken, user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMyTranscript(accessToken)
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function handleDownload() {
    setDownloading(true)
    setDownloadError('')
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/transcript/pdf/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Unable to generate your transcript right now.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${user?.username || 'transcript'}-transcript.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDownloadError(err.message || 'Unable to generate your transcript right now.')
    } finally {
      setDownloading(false)
    }
  }

  const summary = data?.summary
  const courses = data?.courses ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">My Transcript</h1>
          <p className="mt-1 text-sm text-navy-700/55">
            Your full academic record — every course, the hours completed, and the grade earned.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || loading}
          className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
        >
          <IconArrowDown className="h-4 w-4" />
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>
      {downloadError && <p className="text-xs font-medium text-red-600">{downloadError}</p>}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Courses Enrolled" value={summary?.total_courses ?? 0} />
          <StatCard label="Courses Completed" value={summary?.completed_courses ?? 0} />
          <StatCard label="Hours Completed" value={summary?.total_hours_completed ?? 0} />
          <StatCard label="Overall Average" value={summary?.overall_average != null ? `${summary.overall_average}%` : '—'} />
          <StatCard label="Certificates Earned" value={summary?.certificates_earned ?? 0} />
        </div>
      )}

      <DataTable
        loading={loading}
        rows={courses}
        rowKey="course_id"
        emptyMessage="You haven't enrolled in any courses yet."
        columns={[
          {
            key: 'course_title',
            label: 'Course',
            render: (c) => (
              <div>
                <p className="font-semibold text-navy-900">{c.course_title}</p>
                <p className="text-xs text-navy-700/45">{c.category} &middot; {c.level}</p>
              </div>
            ),
          },
          { key: 'duration_hours', label: 'Hours', render: (c) => `${c.duration_hours}h` },
          {
            key: 'status',
            label: 'Status',
            render: (c) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[c.status] ?? ''}`}>
                {STATUS_LABELS[c.status] ?? c.status}
              </span>
            ),
          },
          {
            key: 'completed_at',
            label: 'Completed',
            render: (c) => (c.completed_at ? new Date(c.completed_at).toLocaleDateString() : '—'),
          },
          {
            key: 'grade',
            label: 'Grade',
            render: (c) =>
              c.grade_percentage != null ? (
                <span className="font-bold text-navy-900">
                  {c.letter_grade} <span className="font-normal text-navy-700/50">({c.grade_percentage}%)</span>
                </span>
              ) : (
                '—'
              ),
          },
          {
            key: 'certificate_issued',
            label: 'Certificate',
            render: (c) =>
              c.certificate_issued ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <IconAward className="h-3.5 w-3.5" /> Earned
                </span>
              ) : (
                '—'
              ),
          },
        ]}
      />
    </div>
  )
}
