import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { listCertificates, listEnrollments } from '../../lib/dashboardApi'
import CertificateCard from '../../components/dashboard/CertificateCard'
import StatCard from '../../components/dashboard/StatCard'
import { IconArrowRight, IconAward, IconBook, IconCheck, IconSearch, IconTrendingUp } from '../../components/icons'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-brand-50 text-brand-600',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  suspended: 'bg-navy-100 text-navy-700',
}

function CourseRow({ enrollment }) {
  const { t } = useLanguage()
  const e = enrollment
  const completed = e.status === 'completed'
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10 sm:flex-row sm:items-center">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-navy-900">
        {e.course_detail?.image ? (
          <img src={e.course_detail.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <IconBook className="h-6 w-6 text-white/20" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="truncate text-sm font-bold text-navy-900 dark:text-white">{e.course_detail?.title}</h4>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[e.status] ?? ''}`}>
            {e.status}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-navy-700/50 dark:text-navy-100/50">{e.course_detail?.instructor?.full_name}</p>

        {completed ? (
          <p className="mt-2 text-xs font-semibold text-navy-700/55 dark:text-navy-100/55">
            {t('dashboardStudent.myCourses.completedOn', { date: e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—' })}
          </p>
        ) : (
          <div className="mt-2 max-w-xs">
            <div className="flex items-center justify-between text-xs font-medium text-navy-700/60 dark:text-navy-100/60">
              <span>{t('dashboardStudent.myCourses.progress')}</span>
              <span>{Math.round(e.completion_percentage)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-navy-900/8 dark:bg-white/10">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                style={{ width: `${e.completion_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
        <Link
          to={`/learn/${e.course_detail?.slug}`}
          className="rounded-full bg-navy-900 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          {completed ? t('dashboardStudent.myCourses.reviewCourse') : t('dashboardStudent.myCourses.continueLearning')}
        </Link>
        {completed && e.certificate_issued && (
          <Link
            to="/dashboard/certificates"
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-center text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:ring-emerald-500/20 dark:hover:bg-emerald-500/10"
          >
            <IconAward className="h-3.5 w-3.5" />
            {t('dashboardStudent.myCourses.certificate')}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function MyCourses() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [enrollments, setEnrollments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('in_progress')

  useEffect(() => {
    let cancelled = false
    Promise.all([listEnrollments(accessToken), listCertificates(accessToken)])
      .then(([e, c]) => {
        if (cancelled) return
        setEnrollments(e.results ?? e)
        setCertificates(c.results ?? c)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const inProgress = useMemo(() => enrollments.filter((e) => e.status !== 'completed'), [enrollments])
  const completed = useMemo(() => enrollments.filter((e) => e.status === 'completed'), [enrollments])

  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + Number(e.completion_percentage), 0) / enrollments.length)
    : 0

  const tabs = [
    { key: 'in_progress', label: t('dashboardStudent.myCourses.tabInProgress'), count: inProgress.length },
    { key: 'completed', label: t('dashboardStudent.myCourses.tabCompleted'), count: completed.length },
    { key: 'certificates', label: t('dashboardStudent.myCourses.tabCertificates'), count: certificates.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{t('dashboardStudent.myCourses.eyebrow')}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('dashboardStudent.myCourses.heading')}</h1>
        </div>
        <Link
          to="/dashboard/browse-courses"
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          <IconSearch className="h-3.5 w-3.5" />
          {t('dashboardStudent.myCourses.browseCourses')}
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={IconBook}
          label={t('dashboardStudent.myCourses.coursesCompleted')}
          value={t('dashboardStudent.myCourses.completedOfTotal', { completed: completed.length, total: enrollments.length })}
        />
        <StatCard icon={IconTrendingUp} label={t('dashboardStudent.myCourses.averageProgress')} value={`${averageProgress}%`} accent="navy" />
        <StatCard icon={IconCheck} label={t('dashboardStudent.myCourses.activeCourses')} value={inProgress.length} accent="emerald" />
        <StatCard icon={IconAward} label={t('dashboardStudent.myCourses.certificatesClaimed')} value={certificates.length} accent="emerald" />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-navy-900/8 dark:border-white/10">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === tabItem.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-navy-700/55 hover:text-navy-900 dark:text-navy-100/55 dark:hover:text-white'
            }`}
          >
            {tabItem.label} ({tabItem.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10" />
          ))}
        </div>
      ) : tab === 'certificates' ? (
        certificates.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:text-navy-100/45 dark:ring-white/10">
            {t('dashboardStudent.myCourses.noCertificates')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={{ ...cert, course_title: cert.course_detail?.title }} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {tab === 'completed' && completed.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-5 py-4 dark:bg-emerald-500/10">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                <IconAward className="h-4 w-4" />
                {t('dashboardStudent.myCourses.greatWork', { count: completed.length })}
              </p>
              <button
                type="button"
                onClick={() => setTab('certificates')}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {t('dashboardStudent.myCourses.viewCertificates')} &rarr;
              </button>
            </div>
          )}

          {(tab === 'in_progress' ? inProgress : completed).length === 0 ? (
            <p className="rounded-2xl bg-white p-10 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:text-navy-100/45 dark:ring-white/10">
              {tab === 'in_progress' ? (
                <>{t('dashboardStudent.myCourses.notTakingAny')} <Link to="/dashboard/browse-courses" className="font-semibold text-brand-500">{t('dashboardStudent.myCourses.browseCatalog')}</Link>.</>
              ) : (
                t('dashboardStudent.myCourses.noCompletedCourses')
              )}
            </p>
          ) : (
            (tab === 'in_progress' ? inProgress : completed).map((e) => (
              <CourseRow key={e.id} enrollment={e} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
