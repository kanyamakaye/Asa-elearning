import { IconArrowRight } from './icons'

export default function CTA() {
  return (
    <section id="contact" className="bg-navy-900 py-20">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to start learning today?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-100/70">
          Join thousands of students and instructors already growing their
          skills on Asa Academy.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#signup"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:-translate-y-0.5"
          >
            Create Free Account
            <IconArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#courses"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
          >
            Browse Courses
          </a>
        </div>
      </div>
    </section>
  )
}
