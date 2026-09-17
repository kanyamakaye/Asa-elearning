import { IconAward, IconBook, IconBriefcase, IconClipboard, IconTrendingUp } from './icons'

const steps = [
  { icon: IconBook, label: 'Learn', description: 'Structured lessons from working instructors' },
  { icon: IconClipboard, label: 'Practice', description: 'Quizzes and assignments that reinforce every concept' },
  { icon: IconTrendingUp, label: 'Track Progress', description: 'A dashboard that shows exactly where you stand' },
  { icon: IconAward, label: 'Get Certified', description: 'A verifiable certificate once you complete the course' },
  { icon: IconBriefcase, label: 'Advance', description: 'Proof of skill you can share with employers' },
]

export default function CareerOutcomes() {
  return (
    <section id="outcomes" className="bg-navy-50/60 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Career outcomes
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Learning should lead somewhere.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <div key={step.label} className="animate-fade-up relative text-center" style={{ animationDelay: `${i * 100}ms` }}>
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-7 hidden h-px w-full bg-navy-900/10 lg:block" />
              )}
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm ring-1 ring-navy-900/8 transition-transform duration-300 hover:scale-110">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-navy-900">{step.label}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-700/55">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
