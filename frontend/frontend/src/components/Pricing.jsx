import { Link } from 'react-router-dom'
import useCurrency from '../hooks/useCurrency'
import { IconCheck } from './icons'

const free = [
  'Full access to every free course',
  'Quizzes, assignments, and progress tracking',
  'Course discussions and instructor messaging',
  'A verified certificate on completion',
]

const paid = [
  'Everything in free courses',
  'In-depth, instructor-led paid courses',
  'Lifetime access — learn at your own pace',
  'One clear price per course, no subscription',
]

export default function Pricing() {
  const formatCurrency = useCurrency()
  return (
    <section id="pricing" className="bg-brand-50/50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-navy-700/70">
            No subscriptions or hidden fees. Start with free courses, or pay once
            per course for lifetime access.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="animate-fade-up rounded-3xl bg-white p-8 ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5">
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-700/50">Free Courses</p>
            <p className="mt-3 text-4xl font-extrabold text-navy-900">{formatCurrency(0)}</p>
            <ul className="mt-6 space-y-3">
              {free.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700/75">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-8 block rounded-full py-3 text-center text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
            >
              Create Free Account
            </Link>
          </div>

          <div className="animate-fade-up relative rounded-3xl bg-navy-900 p-8 shadow-xl shadow-navy-900/20 transition-all duration-300 [animation-delay:100ms] hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy-900/30">
            <span className="absolute -top-3 left-8 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
              Most popular
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-100/60">Paid Courses</p>
            <p className="mt-3 text-4xl font-extrabold text-white">Per course</p>
            <ul className="mt-6 space-y-3">
              {paid.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-100/80">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#courses"
              className="mt-8 block rounded-full bg-white py-3 text-center text-sm font-semibold text-navy-900 transition-transform hover:-translate-y-0.5"
            >
              Browse Paid Courses
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
