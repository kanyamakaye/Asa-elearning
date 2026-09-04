import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../lib/dashboardApi'
import { timeAgo } from '../../components/dashboard/RecentActivity'
import CourseCard from '../../components/dashboard/CourseCard'
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
    <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <h3 className="text-sm font-bold text-navy-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-navy-700/45">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 divide-y divide-navy-900/6">
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
  const { accessToken } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    getDashboard('instructor', accessToken).then((d) => !cancelled && setData(d)).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const stats = data?.statistics ?? {}
  const pending = data?.pending_activities ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
          Welcome back{data?.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-navy-700/55">Here's an overview of your courses and students.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={IconBook} label="My Courses" value={stats.my_courses} hint={`${stats.published_courses ?? 0} published`} />
        <StatCard icon={IconUsers} label="Total Students" value={stats.total_students} accent="navy" />
        <StatCard icon={IconTrendingUp} label="New Enrollments" value={stats.new_enrollments} hint="last 7 days" accent="emerald" />
        <StatCard icon={IconFileText} label="Pending Assignments" value={stats.pending_assignments} accent="amber" />
        <StatCard icon={IconClipboard} label="Pending Grades" value={stats.pending_grades} accent="amber" />
        <StatCard icon={IconFileText} label="Upcoming Quizzes" value={stats.upcoming_quizzes} accent="navy" />
        <StatCard icon={IconTrendingUp} label="Upcoming Live Classes" value={stats.upcoming_live_classes} accent="navy" />
        <StatCard icon={IconStar} label="Average Rating" value={stats.average_course_rating ?? '—'} accent="emerald" />
      </div>

      <QuickActions
        actions={[
          { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
          { label: 'Create Quiz', to: '/dashboard/quizzes/create', icon: IconFileText },
          { label: 'Create Assignment', to: '/dashboard/assignments/create', icon: IconFileText },
          { label: 'Schedule Live Class', to: '/dashboard/live-classes/create', icon: IconPlus },
          { label: 'Create Announcement', to: '/dashboard/announcements', icon: IconPlus },
          { label: 'View Students', to: '/dashboard/enrollments', icon: IconUsers },
        ]}
      />

      <div>
        <h3 className="mb-3 text-sm font-bold text-navy-900">My Courses</h3>
        {(data?.courses ?? []).length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8">
            You haven't created any courses yet.
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
          title="Assignments to Grade"
          items={pending.assignments_to_grade ?? []}
          emptyMessage="Nothing to grade right now."
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-navy-800">
                {a.assignment__title} &mdash; {a.student__first_name} {a.student__last_name}
              </span>
              <span className="shrink-0 text-xs text-navy-700/45">{timeAgo(a.submitted_at)}</span>
            </div>
          )}
        />
        <PendingList
          title="Quiz Attempts to Review"
          items={pending.quiz_attempts_to_review ?? []}
          emptyMessage="No attempts awaiting review."
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-navy-800">
                {a.quiz__title} &mdash; {a.student__first_name} {a.student__last_name}
              </span>
              <span className="shrink-0 text-xs text-navy-700/45">{timeAgo(a.submitted_at)}</span>
            </div>
          )}
        />
        <PendingList
          title="Recent Discussion Replies"
          items={pending.recent_discussion_replies ?? []}
          emptyMessage="No recent discussion activity."
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-navy-800">
                {a.user__first_name} {a.user__last_name} on {a.topic__title}
              </span>
              <span className="shrink-0 text-xs text-navy-700/45">{timeAgo(a.created_at)}</span>
            </div>
          )}
        />
      </div>
    </div>
  )
}
