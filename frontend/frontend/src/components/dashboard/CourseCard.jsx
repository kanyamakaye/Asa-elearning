import { Link } from 'react-router-dom'
import { IconBook, IconStar, IconUsers } from '../icons'

const statusStyles = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-amber-50 text-amber-700',
  archived: 'bg-navy-100 text-navy-700',
  suspended: 'bg-red-50 text-red-700',
}

export default function CourseCard({ course }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-navy-900/8">
      <div className="relative h-28 bg-navy-900">
        {course.image ? (
          <img src={course.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <IconBook className="h-8 w-8 text-white/15" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            statusStyles[course.status] ?? statusStyles.draft
          }`}
        >
          {course.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-sm font-bold text-navy-900">{course.title}</h4>
        <p className="mt-1 text-xs text-navy-700/50">{course.course_code}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-navy-700/60">
          <span className="inline-flex items-center gap-1">
            <IconUsers className="h-3.5 w-3.5" />
            {course.student_count ?? 0} students
          </span>
          <span className="inline-flex items-center gap-1">
            <IconStar className="h-3.5 w-3.5 text-amber-400" />
            {course.avg_rating ? Number(course.avg_rating).toFixed(1) : '—'}
          </span>
        </div>

        <p className="mt-2 text-[11px] text-navy-700/40">
          Updated {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : '—'}
        </p>

        <div className="mt-4 flex gap-2 border-t border-navy-900/8 pt-3">
          <Link
            to={`/courses/${course.slug}`}
            className="flex-1 rounded-lg py-1.5 text-center text-xs font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-navy-50"
          >
            View
          </Link>
          <Link
            to={`/dashboard/courses/${course.id}`}
            className="flex-1 rounded-lg bg-navy-900 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-500"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  )
}
