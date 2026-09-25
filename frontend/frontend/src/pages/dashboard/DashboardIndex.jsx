import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import AcademicDashboard from '../academic/AcademicDashboard'
import AdminDashboard from '../admin/AdminDashboard'
import ContentDashboard from '../content/ContentDashboard'
import InstructorDashboard from '../instructor/InstructorDashboard'
import StudentDashboard from '../student/StudentDashboard'
import SupportDashboard from '../support/SupportDashboard'

const DASHBOARD_BY_ROLE = {
  admin: AdminDashboard,
  academic_manager: AcademicDashboard,
  instructor: InstructorDashboard,
  student: StudentDashboard,
  content_manager: ContentDashboard,
  support_staff: SupportDashboard,
}

export default function DashboardIndex() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const Dashboard = DASHBOARD_BY_ROLE[user?.user_type]

  if (!Dashboard) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-navy-700/55 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:text-navy-100/55 dark:ring-white/10">
        {t('dashboardStudent.dashboardIndex.noDashboard')}
      </div>
    )
  }

  return <Dashboard />
}
