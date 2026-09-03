import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { IconArrowRight, IconPhone } from './icons'

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Courses', to: '/#courses' },
      { label: 'Instructors', to: '/#instructors' },
      { label: 'About Us', to: '/#about' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Information Technology', to: '/#courses' },
      { label: 'Software Development', to: '/#courses' },
      { label: 'Data Science', to: '/#courses' },
      { label: 'Business', to: '/#courses' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/#faq' },
      { label: 'Support Center', to: '/contact' },
      { label: 'Privacy Policy', to: '#' },
    ],
  },
]

const socials = [
  { name: 'Facebook', href: '#', path: 'M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3A21 21 0 0 0 14.2 4c-2.24 0-3.77 1.37-3.77 3.88V10.5H8v3h2.43V21Z' },
  { name: 'X', href: '#', path: 'M4 4l16 16M20 4 4 20' },
  { name: 'LinkedIn', href: '#', path: 'M6.5 9.5v9M6.5 6.5v.01M11 18.5v-5.2c0-1.5 1-2.6 2.5-2.6s2.5 1 2.5 2.6v5.2M11 9.5v9' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 pt-20 text-navy-100/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 pb-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
              <span className="text-lg font-bold text-white">Asa Academy</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              An integrated e-learning platform for courses, live classes,
              assessments, and certification &mdash; built for students,
              instructors, and administrators.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-navy-100/70 ring-1 ring-white/10 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-xs ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" />
                <span>
                  <span className="block text-[9px] text-navy-100/50">Download on the</span>
                  <span className="block font-semibold text-white">App Store</span>
                </span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-xs ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" />
                <span>
                  <span className="block text-[9px] text-navy-100/50">Get it on</span>
                  <span className="block font-semibold text-white">Google Play</span>
                </span>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} Asa Academy. All rights reserved.
            </p>
            <form
              className="flex w-full max-w-sm items-center gap-2 sm:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Your email"
                className="w-full rounded-full bg-white/5 px-4 py-2 text-sm text-white placeholder:text-navy-100/40 ring-1 ring-white/10 focus:outline-none focus:ring-brand-400"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-400"
              >
                <IconArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  )
}
