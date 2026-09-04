import { Link } from 'react-router-dom'
import { IconArrowRight, IconBook } from '../icons'

export default function ProgressCard({ course }) {
  const pct = Math.round(course.progress_percentage ?? 0)

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-navy-900/8">
      <div className="relative h-24 bg-navy-900">
        {course.course_image ? (
          <img src={course.course_image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <IconBook className="h-7 w-7 text-white/15" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-sm font-bold text-navy-900">{course.course_title}</h4>
        <p className="mt-0.5 text-xs text-navy-700/50">{course.instructor}</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-medium text-navy-700/60">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-navy-900/8">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {course.current_lesson && (
          <p className="mt-3 text-xs text-navy-700/55">
            Current lesson: <span className="font-medium text-navy-800">{course.current_lesson}</span>
          </p>
        )}

        <Link
          to={`/courses/${course.course_slug}`}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-500"
        >
          Continue Learning
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
