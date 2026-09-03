import { instructors } from '../data/content'
import { IconArrowRight, IconStar, IconUsers } from './icons'

export default function Instructors() {
  return (
    <section id="instructors" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Meet the instructors
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Learn from industry experts
            </h2>
          </div>
          <a
            href="#courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-navy-900"
          >
            View all instructors
            <IconArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((person) => (
            <div
              key={person.name}
              className="group rounded-2xl p-6 text-center ring-1 ring-navy-900/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5"
            >
              <img
                src={person.image}
                alt={person.name}
                loading="lazy"
                decoding="async"
                className="mx-auto h-20 w-20 rounded-full object-cover ring-1 ring-navy-900/8"
              />
              <h3 className="mt-4 text-base font-bold text-navy-900">{person.name}</h3>
              <p className="mt-1 text-xs text-navy-700/55">{person.title}</p>

              <div className="mt-4 flex items-center justify-center gap-4 border-t border-navy-900/8 pt-4 text-xs text-navy-700/65">
                <span className="inline-flex items-center gap-1">
                  <IconUsers className="h-3.5 w-3.5" />
                  {person.students}
                </span>
                <span>{person.courses} courses</span>
                <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
                  <IconStar className="h-3.5 w-3.5 text-amber-400" />
                  {person.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
