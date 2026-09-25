import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getDashboard } from '../../lib/dashboardApi'
import AssessmentTable from '../../components/dashboard/AssessmentTable'
import CertificateCard from '../../components/dashboard/CertificateCard'
import DashboardHero from '../../components/dashboard/DashboardHero'
import ProgressCard from '../../components/dashboard/ProgressCard'
import QuickActions from '../../components/dashboard/QuickActions'
import RemindersPanel from '../../components/dashboard/RemindersPanel'
import StatCard from '../../components/dashboard/StatCard'
import { IconAward, IconBook, IconClipboard, IconFileText, IconSearch, IconTrendingUp } from '../../components/icons'

export default function StudentDashboard() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  function load(isRefresh) {
    if (isRefresh) setRefreshing(true)
    return getDashboard('student', accessToken)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setRefreshing(false))
  }

  useEffect(() => { load(false) }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = data?.statistics ?? {}

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={IconBook}
        title={data?.user?.name ? t('dashboardStudent.studentDashboard.welcomeBackNamed', { name: data.user.name.split(' ')[0] }) : t('dashboardStudent.studentDashboard.welcomeBack')}
        subtitle={t('dashboardStudent.studentDashboard.subtitle')}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={IconBook} label={t('dashboardStudent.studentDashboard.enrolledCourses')} value={stats.enrolled_courses} />
        <StatCard icon={IconTrendingUp} label={t('dashboardStudent.studentDashboard.inProgress')} value={stats.active_courses} accent="emerald" />
        <StatCard icon={IconAward} label={t('dashboardStudent.studentDashboard.completed')} value={stats.completed_courses} accent="emerald" />
        <StatCard icon={IconTrendingUp} label={t('dashboardStudent.studentDashboard.averageProgress')} value={`${stats.average_progress ?? 0}%`} accent="navy" />
        <StatCard icon={IconFileText} label={t('dashboardStudent.studentDashboard.pendingAssignments')} value={stats.pending_assignments} accent="amber" />
        <StatCard icon={IconClipboard} label={t('dashboardStudent.studentDashboard.upcomingQuizzes')} value={stats.upcoming_quizzes} accent="amber" />
        <StatCard icon={IconClipboard} label={t('dashboardStudent.studentDashboard.upcomingExams')} value={stats.upcoming_exams} accent="amber" />
        <StatCard icon={IconAward} label={t('dashboardStudent.studentDashboard.certificatesEarned')} value={stats.certificates} accent="emerald" />
      </div>

      <RemindersPanel reminders={data?.reminders} />

      <QuickActions
        title={t('dashboardStudent.studentDashboard.explore')}
        actions={[
          { label: t('dashboardStudent.studentDashboard.browseCourses'), to: '/dashboard/browse-courses', icon: IconSearch },
          { label: t('dashboardStudent.studentDashboard.myGrades'), to: '/dashboard/grades', icon: IconTrendingUp },
          { label: t('dashboardStudent.studentDashboard.myCertificates'), to: '/dashboard/certificates', icon: IconAward },
        ]}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900 dark:text-white">{t('dashboardStudent.studentDashboard.continueLearning')}</h3>
          <Link to="/dashboard/my-courses" className="text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
            {t('dashboardStudent.studentDashboard.viewAllCourses')} &rarr;
          </Link>
        </div>
        {(data?.continue_learning ?? []).length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:text-navy-100/45 dark:ring-white/10">
            {t('dashboardStudent.studentDashboard.notEnrolledYet')} <Link to="/dashboard/browse-courses" className="font-semibold text-brand-500">{t('dashboardStudent.studentDashboard.browseCatalog')}</Link>.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.continue_learning.map((c) => (
              <ProgressCard key={c.course_id} course={c} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-navy-900 dark:text-white">{t('dashboardStudent.studentDashboard.upcomingAssessments')}</h3>
        <AssessmentTable items={data?.upcoming_assessments ?? []} />
      </div>

      {(data?.certificates ?? []).length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-navy-900 dark:text-white">{t('dashboardStudent.studentDashboard.recentCertificates')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.certificates.slice(0, 4).map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
