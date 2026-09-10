import { Link } from 'react-router-dom'
import { IconChevronLeft, IconStar } from '../icons'
import logo from '../../assets/logo.png'

const STATS = [
  { value: '500+', label: 'Courses' },
  { value: '50k+', label: 'Students' },
  { value: '200+', label: 'Instructors' },
  { value: '98%', label: 'Completion rate' },
]

// The left-hand brand panel shared by every full-page auth screen (login,
// signup, ...) — kept in one place so the marketing copy/visual treatment
// stays consistent instead of drifting per page.
export default function AuthBrandPanel({ badge, heading, description }) {
  return (
    <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(59,107,255,0.35), transparent 40%), radial-gradient(circle at 85% 0%, rgba(111,143,255,0.3), transparent 45%)',
        }}
      />

      <div className="relative flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-white">Asa Academy</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          Home
        </Link>
      </div>

      <div className="relative max-w-md">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-100 ring-1 ring-white/15">
          <IconStar className="h-4 w-4 text-brand-300" />
          {badge}
        </div>
        <h2 className="animate-fade-up mt-6 text-3xl font-extrabold leading-[1.15] tracking-tight text-white [animation-delay:100ms]">
          {heading}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-navy-100/70">{description}</p>
      </div>

      <dl className="relative grid grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-2xl font-bold text-white">{s.value}</dd>
            <div className="mt-1 text-xs text-navy-100/60">{s.label}</div>
          </div>
        ))}
      </dl>
    </div>
  )
}
