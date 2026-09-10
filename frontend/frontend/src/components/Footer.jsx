import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { IconArrowRight, IconCheck, IconMail, IconMapPin, IconPhone } from './icons'

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Courses', to: '/#courses' },
      { label: 'Instructors', to: '/#instructors' },
      { label: 'About Us', to: '/#about' },
      { label: 'Pricing', to: '/#pricing' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Information Technology', to: '/#courses' },
      { label: 'Software Development', to: '/#courses' },
      { label: 'Data Science', to: '/#courses' },
      { label: 'Business', to: '/#courses' },
      { label: 'View all courses', to: '/#courses', emphasis: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/#faq' },
      { label: 'Support Center', to: '/contact' },
      { label: 'Privacy Policy', to: '/contact' },
    ],
  },
]

// Same canonical contact details as the Contact page — keep them in one
// place if those ever change.
const contactDetails = [
  { icon: IconMail, label: 'support@asaacademy.com', href: 'mailto:support@asaacademy.com' },
  { icon: IconPhone, label: '+254 700 123 456', href: 'tel:+254700123456' },
  { icon: IconMapPin, label: 'Westlands Business Park, Nairobi', href: '/contact' },
]

const socials = [
  { name: 'Facebook', href: '#', path: 'M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3A21 21 0 0 0 14.2 4c-2.24 0-3.77 1.37-3.77 3.88V10.5H8v3h2.43V21Z' },
  { name: 'X', href: '#', path: 'M4 4l16 16M20 4 4 20' },
  { name: 'LinkedIn', href: '#', path: 'M6.5 9.5v9M6.5 6.5v.01M11 18.5v-5.2c0-1.5 1-2.6 2.5-2.6s2.5 1 2.5 2.6v5.2M11 9.5v9' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return
    // No newsletter backend exists yet — this just gives the visitor honest
    // local confirmation instead of a silent no-op submit.
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-navy-950 pt-20 text-navy-100/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 pb-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
                <img src={logo} alt="Asa Academy" className="h-full w-full object-contain" />
              </span>
              <span className="font-display text-lg font-bold text-white">Asa Academy</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              An integrated e-learning platform for courses, live classes,
              assessments, and certification &mdash; built for students,
              instructors, and administrators.
            </p>

            <ul className="mt-6 space-y-2.5">
              {contactDetails.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-2.5 text-sm transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>

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
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={`text-sm transition-colors hover:text-white ${
                        link.emphasis ? 'font-semibold text-brand-400' : ''
                      }`}
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
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} Asa Academy. All rights reserved.
            </p>

            <form onSubmit={handleSubscribe} className="w-full max-w-sm sm:w-auto">
              {subscribed ? (
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <IconCheck className="h-4 w-4" /> Thanks — you&apos;re on the list.
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-white">Stay in the loop</p>
                  <div className="mt-2 flex w-full items-center gap-2 sm:w-72">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </footer>
  )
}
