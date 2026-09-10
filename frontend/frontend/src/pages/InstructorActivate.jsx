import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import { PASSWORD_RULES } from '../lib/passwordRules'
import { IconArrowRight, IconCheck, IconEye, IconEyeOff, IconLock } from '../components/icons'
import logo from '../assets/logo.png'

// Authentication.md §19 — "/instructor/activate?token=<token>". An Admin-
// created Instructor lands here from their invitation email to set their
// own password; the Admin never sees or sets it.
export default function InstructorActivate() {
  const { activateInstructor } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)

  const passwordChecks = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }))
  const passwordValid = passwordChecks.every((c) => c.met)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const data = await activateInstructor(token, password, confirmPassword)
      navigate('/verify-email?flow=instructor', { state: { email: data.email } })
    } catch (err) {
      setError(err.message || 'This invitation is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center">
        <p className="text-sm text-navy-700/60">
          This activation link is missing its invitation token. Please use the link from your invitation email.
        </p>
        <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        badge="Welcome to the Asa Academy teaching team"
        heading={
          <>
            Set up your{' '}
            <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-brand-500 bg-clip-text text-transparent">
              Instructor account
            </span>
          </>
        }
        description="Create your own password to activate the Instructor account an administrator set up for you. You'll verify your email and complete a quick security check next."
      />

      <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12 lg:bg-white">
        <div className="animate-fade-up w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold tracking-tight text-navy-900">Asa Academy</span>
          </Link>

          <div className="mt-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 lg:mt-4 lg:p-0 lg:shadow-none lg:ring-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Activate your Instructor account</h1>
            <p className="mt-2 text-sm text-navy-700/60">Create a password to continue. You'll verify your email next.</p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-navy-900">Password</span>
                <div className="relative mt-2">
                  <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setTouched(true)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-navy-900/10 py-3 pl-11 pr-11 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-700/40 hover:text-navy-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <IconEyeOff className="h-4.5 w-4.5" /> : <IconEye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {touched && (
                  <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {passwordChecks.map((c) => (
                      <li
                        key={c.label}
                        className={`flex items-center gap-1.5 text-xs ${c.met ? 'text-emerald-600' : 'text-navy-700/40'}`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                            c.met ? 'bg-emerald-100' : 'bg-navy-900/8'
                          }`}
                        >
                          {c.met && <IconCheck className="h-2.5 w-2.5" />}
                        </span>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900">Confirm password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-navy-900/10 focus:border-brand-400 focus:ring-brand-100'
                  }`}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">Passwords do not match.</p>
                )}
              </label>

              <button
                type="submit"
                disabled={loading || !passwordValid || !passwordsMatch}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                {loading ? 'Activating…' : 'Continue'}
                {!loading && <IconArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
