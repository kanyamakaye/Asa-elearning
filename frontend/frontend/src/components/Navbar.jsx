import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { IconClose, IconMenu } from './icons'

const links = [
  { label: 'Home', to: '/#home' },
  { label: 'Courses', to: '/#courses' },
  { label: 'Instructors', to: '/#instructors' },
  { label: 'About', to: '/#about' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-tight text-navy-900">
            Asa Academy
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-navy-700/80 transition-colors hover:text-brand-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-navy-700/70">
                Hi, {user?.first_name || user?.username}
              </span>
              <Link
                to="/dashboard"
                className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-navy-900/20 transition-colors hover:bg-brand-500"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-semibold text-navy-800 transition-colors hover:text-brand-500"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-navy-800 transition-colors hover:text-brand-500"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-navy-900/20 transition-colors hover:bg-brand-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-navy-900 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-900/5 bg-white px-6 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-navy-900/5 pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout()
                    setOpen(false)
                  }}
                  className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-navy-800 ring-1 ring-navy-900/10"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-navy-800 ring-1 ring-navy-900/10"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
