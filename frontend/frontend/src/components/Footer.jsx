import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getCategories } from '../lib/queries'
import logo from '../assets/logo.png'
import { IconArrowRight, IconCheck, IconHelpCircle, IconLifeBuoy } from './icons'

// Mirrors sampleUI.md's reference footer (Alison.com): a wide top grid of
// link columns, then a bottom bar with brand/socials on one side and a
// secondary block (their Trustpilot rating + app badges, ours a location
// card) on the other. Content below is kept honest to what Asa Academy
// actually has — no fabricated pages (no blog, no mobile app, no investor
// pages) — rather than a 1:1 content copy of Alison's own footer.
const platformLinks = [
  { id: 'home', to: '/' },
  { id: 'courses', to: '/courses' },
  { id: 'instructors', to: '/#instructors' },
  { id: 'aboutUs', to: '/#about' },
  { id: 'pricing', to: '/#pricing' },
]

const studentLinks = [
  { id: 'browseCourses', to: '/courses' },
  { id: 'learningPaths', to: '/#paths' },
  { id: 'careerOutcomes', to: '/#outcomes' },
  { id: 'verifyCertificate', to: '/verify-certificate' },
  { id: 'createAccount', to: '/signup' },
  { id: 'logIn', to: '/login' },
]

const instructorLinks = [
  { id: 'becomeInstructor', to: '/signup?role=instructor' },
  { id: 'meetInstructors', to: '/#instructors' },
  { id: 'instructorPricing', to: '/#pricing' },
]

const supportLinks = [
  { id: 'contactUs', to: '/contact' },
  { id: 'faq', to: '/#faq' },
  { id: 'helpCenter', to: '/contact' },
  { id: 'privacyPolicy', to: '/contact' },
  { id: 'termsOfService', to: '/contact' },
]

const MAP_EMBED_SRC = 'https://www.google.com/maps?q=-1.886829,30.276593&z=15&output=embed'
const MAP_LINK = 'https://maps.app.goo.gl/E1tJitEXNYidETnt6'

const socials = [
  { name: 'Facebook', href: '#', path: 'M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3A21 21 0 0 0 14.2 4c-2.24 0-3.77 1.37-3.77 3.88V10.5H8v3h2.43V21Z' },
  { name: 'X', href: '#', path: 'M4 4l16 16M20 4 4 20' },
  { name: 'LinkedIn', href: '#', path: 'M6.5 9.5v9M6.5 6.5v.01M11 18.5v-5.2c0-1.5 1-2.6 2.5-2.6s2.5 1 2.5 2.6v5.2M11 9.5v9' },
]

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wide text-white">{title}</h3>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-sm text-navy-100/70 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  )
}

export default function Footer() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    getCategories()
      .then((data) => setCategories((data.results ?? data).slice(0, 8)))
      .catch(() => {})
  }, [])

  function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return
    // No newsletter backend exists yet — this just gives the visitor honest
    // local confirmation instead of a silent no-op submit.
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-navy-950 pt-16 text-navy-100/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Top: wide link grid, matching sampleUI.md's 5-column layout */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-14 sm:grid-cols-3 lg:grid-cols-5">
          <FooterColumn title={t('public.footer.columns.platform')}>
            {platformLinks.map((l) => <FooterLink key={l.id} to={l.to}>{t(`public.footer.links.${l.id}`)}</FooterLink>)}
          </FooterColumn>

          <FooterColumn title={t('public.footer.columns.categories')}>
            {categories.map((c) => (
              <FooterLink key={c.id} to={`/courses?category=${c.slug}`}>{c.name}</FooterLink>
            ))}
            <FooterLink to="/courses">
              <span className="font-semibold text-brand-400">{t('public.footer.viewAllCourses')}</span>
            </FooterLink>
          </FooterColumn>

          <FooterColumn title={t('public.footer.columns.forStudents')}>
            {studentLinks.map((l) => <FooterLink key={l.id} to={l.to}>{t(`public.footer.links.${l.id}`)}</FooterLink>)}
          </FooterColumn>

          <FooterColumn title={t('public.footer.columns.forInstructors')}>
            {instructorLinks.map((l) => <FooterLink key={l.id} to={l.to}>{t(`public.footer.links.${l.id}`)}</FooterLink>)}
          </FooterColumn>

          <FooterColumn title={t('public.footer.columns.support')}>
            {supportLinks.map((l) => <FooterLink key={l.id} to={l.to}>{t(`public.footer.links.${l.id}`)}</FooterLink>)}
          </FooterColumn>
        </div>

        {/* Middle: brand + quick links + socials on one side, location on the other */}
        <div className="grid gap-10 border-t border-white/10 py-10 lg:grid-cols-2">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
                <img src={logo} alt="Asa Academy" className="h-full w-full object-contain" />
              </span>
              <div>
                <span className="block font-display text-lg font-bold leading-tight text-white">Asa Academy</span>
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-navy-100/45">
                  {t('public.footer.tagline')}
                </span>
              </div>
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to="/#faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-300">
                <IconHelpCircle className="h-4 w-4" />
                {t('public.footer.faqs')}
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-300">
                <IconLifeBuoy className="h-4 w-4" />
                {t('public.footer.customerSupport')}
              </Link>
            </div>

            <div className="mt-5 flex gap-3">
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

          <div className="lg:max-w-sm lg:justify-self-end">
            <h3 className="text-xs font-bold uppercase tracking-wide text-white">{t('public.footer.findUs')}</h3>
            <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <iframe
                title="Asa Academy location"
                src={MAP_EMBED_SRC}
                width="100%"
                height="140"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block grayscale-[0.3] invert-[0.92] hue-rotate-180 contrast-[0.9]"
              />
            </div>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 transition-colors hover:text-white"
            >
              {t('public.footer.getDirections')}
              <IconArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom-most: legal + copyright, small newsletter signup */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span>{t('public.footer.copyright', { year: new Date().getFullYear() })}</span>
              <Link to="/contact" className="transition-colors hover:text-white">{t('public.footer.privacy')}</Link>
              <Link to="/contact" className="transition-colors hover:text-white">{t('public.footer.terms')}</Link>
              <Link to="/contact" className="transition-colors hover:text-white">{t('public.footer.cookiePolicy')}</Link>
            </div>

            <form onSubmit={handleSubscribe} className="w-full max-w-sm sm:w-auto">
              {subscribed ? (
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <IconCheck className="h-4 w-4" /> {t('public.footer.subscribed')}
                </p>
              ) : (
                <div className="flex w-full items-center gap-2 sm:w-72">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    {t('public.footer.emailAddress')}
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('public.footer.emailPlaceholder')}
                    className="w-full rounded-full bg-white/5 px-4 py-2 text-sm text-white placeholder:text-navy-100/40 ring-1 ring-white/10 focus:outline-none focus:ring-brand-400"
                  />
                  <button
                    type="submit"
                    aria-label={t('public.footer.subscribe')}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-400"
                  >
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </footer>
  )
}
