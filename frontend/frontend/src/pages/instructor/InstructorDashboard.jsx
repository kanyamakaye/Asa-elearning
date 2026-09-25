import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getDashboard } from '../../lib/dashboardApi'
import { timeAgo } from '../../components/dashboard/RecentActivity'
import CourseCard from '../../components/dashboard/CourseCard'
import DashboardHero from '../../components/dashboard/DashboardHero'
import QuickActions from '../../components/dashboard/QuickActions'
import StatCard from '../../components/dashboard/StatCard'
import {
  IconBook,
  IconClipboard,
  IconFileText,
  IconPlus,
  IconStar,
  IconTrendingUp,
  IconUsers,
} from '../../components/icons'

function PendingList({ title, items, renderItem, emptyMessage }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
      <h3 className="text-sm font-bold text-navy-900 dark:text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-navy-700/45 dark:text-navy-100/45">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 divide-y divide-navy-900/6 dark:divide-white/5">
          {items.map((item, i) => (
            <li key={i} className="py-2.5 first:pt-0 last:pb-0 text-sm">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function InstructorDashboard() {
  const { t } = useLanguage()
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  function load(isRefresh) {
    if (isRefresh) setRefreshing(true)
    return getDashboard('instructor', accessToken)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setRefreshing(false))
  }

  useEffect(() => { load(false) }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = data?.statistics ?? {}
  const pending = data?.pending_activities ?? {}

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={IconBook}
        title={data?.user?.name ? t('dashboardInstructor.instructorDashboard.welcomeBackName', { name: data.user.name.split(' ')[0] }) : t('dashboardInstructor.instructorDashboard.welcomeBack')}
        subtitle={t('dashboardInstructor.instructorDashboard.subtitle')}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={IconBook} label={t('dashboardInstructor.instructorDashboard.myCourses')} value={stats.my_courses} hint={t('dashboardInstructor.instructorDashboard.publishedHint', { count: stats.published_courses ?? 0 })} />
        <StatCard icon={IconUsers} label={t('dashboardInstructor.instructorDashboard.totalStudents')} value={stats.total_students} accent="navy" />
        <StatCard icon={IconTrendingUp} label={t('dashboardInstructor.instructorDashboard.newEnrollments')} value={stats.new_enrollments} hint={t('dashboardInstructor.instructorDashboard.last7Days')} accent="emerald" />
        <StatCard icon={IconFileText} label={t('dashboardInstructor.instructorDashboard.pendingAssignments')} value={stats.pending_assignments} accent="amber" />
        <StatCard icon={IconClipboard} label={t('dashboardInstructor.instructorDashboard.pendingGrades')} value={stats.pending_grades} accent="amber" />
        <StatCard icon={IconFileText} label={t('dashboardInstructor.instructorDashboard.upcomingQuizzes')} value={stats.upcoming_quizzes} accent="navy" />
        <StatCard icon={IconTrendingUp} label={t('dashboardInstructor.instructorDashboard.upcomingLiveClasses')} value={stats.upcoming_live_classes} accent="navy" />
        <StatCard icon={IconStar} label={t('dashboardInstructor.instructorDashboard.averageRating')} value={stats.average_course_rating ?? '—'} accent="emerald" />
      </div>

      <QuickActions
        actions={[
          { label: t('dashboardInstructor.instructorDashboard.actionCreateCourse'), to: '/dashboard/courses/create', icon: IconBook },
          { label: t('dashboardInstructor.instructorDashboard.actionCreateQuiz'), to: '/dashboard/quizzes/create', icon: IconFileText },
          { label: t('dashboardInstructor.instructorDashboard.actionCreateAssignment'), to: '/dashboard/assignments/create', icon: IconFileText },
          { label: t('dashboardInstructor.instructorDashboard.actionScheduleLiveClass'), to: '/dashboard/live-classes/create', icon: IconPlus },
          { label: t('dashboardInstructor.instructorDashboard.actionCreateAnnouncement'), to: '/dashboard/announcements', icon: IconPlus },
          { label: t('dashboardInstructor.instructorDashboard.actionViewStudents'), to: '/dashboard/enrollments', icon: IconUsers },
        ]}
      />

      <div>
        <h3 className="mb-3 text-sm font-bold text-navy-900 dark:text-white">{t('dashboardInstructor.instructorDashboard.myCoursesHeading')}</h3>
        {(data?.courses ?? []).length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:text-navy-100/45 dark:ring-white/10">
            {t('dashboardInstructor.instructorDashboard.noCoursesYet')}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PendingList
          title={t('dashboardInstructor.instructorDashboard.assignmentsToGrade')}
          items={pending.assignments_to_grade ?? []}
          emptyMessage={t('dashboardInstructor.instructorDashboard.nothingToGrade')}
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-navy-800 dark:text-navy-100">
                {a.assignment__title} &mdash; {a.student__first_name} {a.student__last_name}
              </span>
              <span className="shrink-0 text-xs text-navy-700/45 dark:text-navy-100/45">{timeAgo(a.submitted_at)}</span>
            </div>
          )}
        />
        <PendingList
          title={t('dashboardInstructor.instructorDashboard.quizAttemptsToReview')}
          items={pending.quiz_attempts_to_review ?? []}
          emptyMessage={t('dashboardInstructor.instructorDashboard.noAttemptsAwaiting')}
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-navy-800 dark:text-navy-100">
                {a.quiz__title} &mdash; {a.student__first_name} {a.student__last_name}
              </span>
              <span className="shrink-0 text-xs text-navy-700/45 dark:text-navy-100/45">{timeAgo(a.submitted_at)}</span>
            </div>
          )}
        />
        <PendingList
          title={t('dashboardInstructor.instructorDashboard.recentDiscussionReplies')}
          items={pending.recent_discussion_replies ?? []}
          emptyMessage={t('dashboardInstructor.instructorDashboard.noRecentDiscussion')}
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-navy-800 dark:text-navy-100">
                {t('dashboardInstructor.instructorDashboard.discussionReplyOn', { name: `${a.user__first_name} ${a.user__last_name}`, topic: a.topic__title })}
              </span>
              <span className="shrink-0 text-xs text-navy-700/45 dark:text-navy-100/45">{timeAgo(a.created_at)}</span>
            </div>
          )}
        />
      </div>
    </div>
  )
}
