import { Link } from 'react-router-dom'
import { IconArrowRight } from './icons'

export default function CTA() {
  return (
    <section id="contact" className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-8 py-14 text-center shadow-xl shadow-navy-900/15 sm:px-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to start learning today?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-100/70">
            Join thousands of students and instructors already growing their
            skills on Asa Academy.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:-translate-y-0.5"
            >
              Create Free Account
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
