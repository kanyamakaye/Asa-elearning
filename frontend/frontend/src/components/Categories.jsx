import { categories } from '../data/content'

export default function Categories() {
  return (
    <section className="bg-brand-50/50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Browse by category
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Explore course categories
            </h2>
          </div>
          <a
            href="#courses"
            className="text-sm font-semibold text-brand-500 hover:text-navy-900"
          >
            View all categories &rarr;
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <a
              key={c.id}
              href="#courses"
              className="group rounded-2xl bg-white p-6 ring-1 ring-navy-900/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5 hover:ring-brand-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white transition-colors group-hover:bg-brand-500">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-navy-900">{c.name}</h3>
              <p className="mt-1 text-xs text-navy-700/55">{c.count} courses</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
