import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import CoursesMegaMenu from './CoursesMegaMenu'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { IconClose, IconMenu } from './icons'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  // The desktop nav swaps "Courses" for <CoursesMegaMenu /> (below) — kept
  // here too so the mobile menu still gets a plain link to the same anchor.
  const links = [
    { key: 'home', label: t('public.nav.home'), to: '/#home' },
    { key: 'courses', label: t('public.nav.courses'), to: '/courses' },
    { key: 'instructors', label: t('public.nav.instructors'), to: '/#instructors' },
    { key: 'pricing', label: t('public.nav.pricing'), to: '/#pricing' },
    { key: 'about', label: t('public.nav.about'), to: '/#about' },
    { key: 'faq', label: t('public.nav.faq'), to: '/#faq' },
    { key: 'contact', label: t('public.nav.contact'), to: '/contact' },
  ]

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/5 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-navy-950/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">
            Asa Academy
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) =>
            link.key === 'courses' ? (
              <CoursesMegaMenu key={link.key} />
            ) : (
              <Link
                key={link.key}
                to={link.to}
                className="text-sm font-medium text-navy-700/80 transition-colors hover:text-brand-500 dark:text-navy-100/75 dark:hover:text-brand-300"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <span className="h-5 w-px bg-navy-900/10 dark:bg-white/15" />
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-navy-700/70 dark:text-navy-100/70">
                {t('public.nav.greeting', { name: user?.first_name || user?.username })}
              </span>
              <Link
                to="/dashboard"
                className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-navy-900/20 transition-colors hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {t('public.nav.dashboard')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-semibold text-navy-800 transition-colors hover:text-brand-500 dark:text-navy-100 dark:hover:text-brand-300"
              >
                {t('public.nav.logOut')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-navy-800 transition-colors hover:text-brand-500 dark:text-navy-100 dark:hover:text-brand-300"
              >
                {t('public.nav.logIn')}
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-navy-900/20 transition-colors hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {t('public.nav.getStarted')}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-navy-900 dark:text-white"
            aria-label={t('public.nav.toggleMenu')}
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-navy-900/5 bg-white px-6 pb-6 pt-2 dark:border-white/10 dark:bg-navy-950 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-brand-50 dark:text-navy-100 dark:hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-navy-900/5 pt-4 dark:border-white/10">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-brand-500"
                >
                  {t('public.nav.dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout()
                    setOpen(false)
                  }}
                  className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-navy-800 ring-1 ring-navy-900/10 dark:text-navy-100 dark:ring-white/15"
                >
                  {t('public.nav.logOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-navy-800 ring-1 ring-navy-900/10 dark:text-navy-100 dark:ring-white/15"
                >
                  {t('public.nav.logIn')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-brand-500"
                >
                  {t('public.nav.getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
