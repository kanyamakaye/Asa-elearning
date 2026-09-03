const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up in minutes as a student and tell us what you want to learn.',
  },
  {
    number: '02',
    title: 'Browse & enroll',
    description: 'Search by category, level, or instructor and enroll in the courses that fit your goals.',
  },
  {
    number: '03',
    title: 'Learn at your pace',
    description: 'Watch lessons, join live classes, complete quizzes and assignments, and track your progress.',
  },
  {
    number: '04',
    title: 'Earn your certificate',
    description: 'Finish the course and receive a verified certificate you can share and prove.',
  },
]

export default function HowItWorks() {
  return (
    <section id="about" className="bg-navy-900 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start learning in four simple steps
          </h2>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-6 hidden h-px w-full -translate-x-0 bg-white/10 lg:block" />
              )}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-100/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
