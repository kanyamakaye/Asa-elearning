import {
  IconAward,
  IconChart,
  IconChat,
  IconClipboard,
  IconUsers,
  IconVideo,
} from './icons'

const features = [
  {
    icon: IconVideo,
    title: 'Live & recorded classes',
    description:
      'Join scheduled live sessions with instructors or learn at your own pace with on-demand video lessons.',
  },
  {
    icon: IconClipboard,
    title: 'Quizzes & assignments',
    description:
      'Test your understanding with quizzes and coursework, then get graded with detailed instructor feedback.',
  },
  {
    icon: IconChart,
    title: 'Progress tracking',
    description:
      'Follow your learning journey lesson by lesson with a personal dashboard that shows exactly where you stand.',
  },
  {
    icon: IconAward,
    title: 'Verified certificates',
    description:
      'Earn a certificate of completion for every course you finish, with a unique code anyone can verify.',
  },
  {
    icon: IconChat,
    title: 'Discussions & messaging',
    description:
      'Ask questions in course discussions and message instructors directly whenever you get stuck.',
  },
  {
    icon: IconUsers,
    title: 'Built for every role',
    description:
      'Purpose-built dashboards for students, instructors, and administrators keep everyone focused on what matters.',
  },
]

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Why Asa Academy
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Everything you need to learn and teach online
          </h2>
          <p className="mt-4 text-lg text-navy-700/70">
            One integrated environment for the entire learning lifecycle
            &mdash; from enrollment to certification.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-navy-900/8 p-7 transition-shadow hover:shadow-xl hover:shadow-navy-900/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-navy-900 group-hover:text-white">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-700/65">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
