import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import AssessmentTable from '../../components/dashboard/AssessmentTable'
import CertificateCard from '../../components/dashboard/CertificateCard'
import DashboardHero from '../../components/dashboard/DashboardHero'
import ProgressCard from '../../components/dashboard/ProgressCard'
import QuickActions from '../../components/dashboard/QuickActions'
import StatCard from '../../components/dashboard/StatCard'
import { IconAward, IconBook, IconClipboard, IconFileText, IconSearch, IconTrendingUp } from '../../components/icons'

export default function StudentDashboard() {
  const { accessToken } = useAuth()
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
        title={`Welcome back${data?.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}`}
        subtitle="Pick up where you left off."
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={IconBook} label="Enrolled Courses" value={stats.enrolled_courses} />
        <StatCard icon={IconTrendingUp} label="In Progress" value={stats.active_courses} accent="emerald" />
        <StatCard icon={IconAward} label="Completed" value={stats.completed_courses} accent="emerald" />
        <StatCard icon={IconTrendingUp} label="Average Progress" value={`${stats.average_progress ?? 0}%`} accent="navy" />
        <StatCard icon={IconFileText} label="Pending Assignments" value={stats.pending_assignments} accent="amber" />
        <StatCard icon={IconClipboard} label="Upcoming Quizzes" value={stats.upcoming_quizzes} accent="amber" />
        <StatCard icon={IconClipboard} label="Upcoming Exams" value={stats.upcoming_exams} accent="amber" />
        <StatCard icon={IconAward} label="Certificates Earned" value={stats.certificates} accent="emerald" />
      </div>

      <QuickActions
        title="Explore"
        actions={[
          { label: 'Browse Courses', to: '/dashboard/browse-courses', icon: IconSearch },
          { label: 'My Grades', to: '/dashboard/grades', icon: IconTrendingUp },
          { label: 'My Certificates', to: '/dashboard/certificates', icon: IconAward },
        ]}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Continue Learning</h3>
          <Link to="/dashboard/my-courses" className="text-xs font-semibold text-brand-500 hover:text-navy-900">
            View all courses &rarr;
          </Link>
        </div>
        {(data?.continue_learning ?? []).length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8">
            You're not enrolled in any courses yet. <Link to="/dashboard/browse-courses" className="font-semibold text-brand-500">Browse the catalog</Link>.
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
        <h3 className="mb-3 text-sm font-bold text-navy-900">Upcoming Assessments</h3>
        <AssessmentTable items={data?.upcoming_assessments ?? []} />
      </div>

      {(data?.certificates ?? []).length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-navy-900">Recent Certificates</h3>
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
