import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { API_BASE_URL } from '../../lib/api'
import { getMyTranscript } from '../../lib/queries'
import DataTable from '../../components/dashboard/DataTable'
import { IconArrowDown, IconAward } from '../../components/icons'

const STATUS_KEYS = {
  active: 'inProgress',
  completed: 'completed',
  pending: 'pending',
  cancelled: 'cancelled',
  suspended: 'suspended',
}

const statusStyles = {
  active: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  suspended: 'bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-navy-100',
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-navy-700/55 dark:text-navy-100/55">{label}</p>
    </div>
  )
}

export default function Transcript() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [search, setSearch] = useState('')

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
      if (!res.ok) throw new Error(t('dashboardStudent.transcript.generateError'))
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
      setDownloadError(err.message || t('dashboardStudent.transcript.generateError'))
    } finally {
      setDownloading(false)
    }
  }

  const summary = data?.summary
  const courses = (data?.courses ?? []).filter((c) => {
    const q = search.trim().toLowerCase()
    return !q || c.course_title?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('dashboardStudent.transcript.heading')}</h1>
          <p className="mt-1 text-sm text-navy-700/55 dark:text-navy-100/55">
            {t('dashboardStudent.transcript.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || loading}
          className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          <IconArrowDown className="h-4 w-4" />
          {downloading ? t('dashboardStudent.transcript.preparing') : t('dashboardStudent.transcript.downloadPdf')}
        </button>
      </div>
      {downloadError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{downloadError}</p>}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label={t('dashboardStudent.transcript.coursesEnrolled')} value={summary?.total_courses ?? 0} />
          <StatCard label={t('dashboardStudent.transcript.coursesCompleted')} value={summary?.completed_courses ?? 0} />
          <StatCard label={t('dashboardStudent.transcript.hoursCompleted')} value={summary?.total_hours_completed ?? 0} />
          <StatCard label={t('dashboardStudent.transcript.overallAverage')} value={summary?.overall_average != null ? `${summary.overall_average}%` : '—'} />
          <StatCard label={t('dashboardStudent.transcript.certificatesEarned')} value={summary?.certificates_earned ?? 0} />
        </div>
      )}

      <DataTable
        loading={loading}
        rows={courses}
        rowKey="course_id"
        emptyMessage={t('dashboardStudent.transcript.noEnrollments')}
        search={{ value: search, onChange: setSearch, placeholder: t('dashboardStudent.transcript.searchPlaceholder') }}
        exportFilename="transcript"
        exportTitle={t('dashboardStudent.transcript.exportTitle')}
        columns={[
          {
            key: 'course_title',
            label: t('dashboardStudent.transcript.columnCourse'),
            exportValue: (c) => c.course_title,
            render: (c) => (
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">{c.course_title}</p>
                <p className="text-xs text-navy-700/45 dark:text-navy-100/45">{c.category} &middot; {c.level}</p>
              </div>
            ),
          },
          { key: 'duration_hours', label: t('dashboardStudent.transcript.columnHours'), render: (c) => `${c.duration_hours}h` },
          {
            key: 'status',
            label: t('dashboardStudent.transcript.columnStatus'),
            exportValue: (c) => t(`dashboardStudent.transcript.status.${STATUS_KEYS[c.status] ?? c.status}`),
            render: (c) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[c.status] ?? ''}`}>
                {t(`dashboardStudent.transcript.status.${STATUS_KEYS[c.status] ?? c.status}`)}
              </span>
            ),
          },
          {
            key: 'completed_at',
            label: t('dashboardStudent.transcript.columnCompleted'),
            render: (c) => (c.completed_at ? new Date(c.completed_at).toLocaleDateString() : '—'),
          },
          {
            key: 'grade',
            label: t('dashboardStudent.transcript.columnGrade'),
            exportValue: (c) => (c.grade_percentage != null ? `${c.letter_grade} (${c.grade_percentage}%)` : ''),
            render: (c) =>
              c.grade_percentage != null ? (
                <span className="font-bold text-navy-900 dark:text-white">
                  {c.letter_grade} <span className="font-normal text-navy-700/50 dark:text-navy-100/50">({c.grade_percentage}%)</span>
                </span>
              ) : (
                '—'
              ),
          },
          {
            key: 'certificate_issued',
            label: t('dashboardStudent.transcript.columnCertificate'),
            exportValue: (c) => (c.certificate_issued ? t('dashboardStudent.transcript.earned') : ''),
            render: (c) =>
              c.certificate_issued ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <IconAward className="h-3.5 w-3.5" /> {t('dashboardStudent.transcript.earned')}
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
