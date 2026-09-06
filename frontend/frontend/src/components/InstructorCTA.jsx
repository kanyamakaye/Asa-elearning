import { Link } from 'react-router-dom'
import { IconArrowRight, IconCheck } from './icons'

const points = [
  'Create and publish unlimited courses',
  'Run live classes and track attendance',
  'Grade quizzes and assignments with ease',
  'Get paid for every enrollment',
]

export default function InstructorCTA() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-8 py-14 lg:grid-cols-2 lg:px-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">
              For instructors
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Share your expertise with thousands of learners
            </h2>
            <p className="mt-4 text-navy-100/70">
              Asa Academy gives instructors everything needed to build, teach,
              and grow a course &mdash; from content creation to grading and
              analytics.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-navy-900 shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
            >
              Start Teaching Today
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="grid gap-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                  <IconCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-navy-100/85">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
