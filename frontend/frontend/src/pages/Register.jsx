import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import { PASSWORD_RULES } from '../lib/passwordRules'
import { IconArrowRight, IconCheck, IconChevronLeft, IconEye, IconEyeOff, IconLock, IconMail } from '../components/icons'
import logo from '../assets/logo.png'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    acceptTerms: false,
    acceptPrivacyPolicy: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touchedPassword, setTouchedPassword] = useState(false)

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm((f) => ({ ...f, [field]: value }))
    }
  }

  const passwordChecks = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(form.password) }))
  const passwordValid = passwordChecks.every((c) => c.met)
  const passwordsMatch = form.password.length > 0 && form.password === form.passwordConfirm

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (!form.acceptTerms || !form.acceptPrivacyPolicy) {
      setError('Please accept the Terms and Conditions and Privacy Policy to continue.')
      return
    }

    setLoading(true)
    try {
      const data = await register(form)
      navigate('/verify-email', { state: { email: data?.email || form.email } })
    } catch (err) {
      setError(err.message || 'Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        badge="Join 50,000+ learners already growing with us"
        heading={
          <>
            Start learning{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-500 to-brand-500 bg-clip-text text-transparent">
              today, for free
            </span>
          </>
        }
        description="Create your Asa Academy learner account in minutes — verify your email, and you're ready to enroll in your first course."
      />

      <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12 lg:bg-white">
        <div className="animate-fade-up w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700/55 hover:text-brand-500 lg:hidden"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold tracking-tight text-navy-900">Asa Academy</span>
          </Link>

          <Link
            to="/"
            className="mb-6 hidden items-center gap-1.5 text-xs font-semibold text-navy-700/55 hover:text-brand-500 lg:inline-flex"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="mt-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 lg:mt-4 lg:p-0 lg:shadow-none lg:ring-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Create your learner account</h1>
            <p className="mt-2 text-sm text-navy-700/60">
              Join Asa Academy and start learning today &mdash; it&apos;s free.
            </p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-navy-900">First name</span>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={update('firstName')}
                    className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-navy-900">Last name</span>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={update('lastName')}
                    className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900">Username</span>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={update('username')}
                  className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900">Email address</span>
                <div className="relative mt-2">
                  <IconMail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-navy-900/10 py-3 pl-11 pr-4 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900">Password</span>
                <div className="relative mt-2">
                  <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update('password')}
                    onFocus={() => setTouchedPassword(true)}
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
                {touchedPassword && (
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
                  value={form.passwordConfirm}
                  onChange={update('passwordConfirm')}
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 ${
                    form.passwordConfirm && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-navy-900/10 focus:border-brand-400 focus:ring-brand-100'
                  }`}
                />
                {form.passwordConfirm && !passwordsMatch && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">Passwords do not match.</p>
                )}
              </label>

              <div className="space-y-2.5 border-t border-navy-900/8 pt-5">
                <label className="flex items-start gap-2.5 text-sm text-navy-700/75">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={update('acceptTerms')}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-900/20 text-brand-500 focus:ring-brand-200"
                  />
                  <span>I agree to the Asa Academy Terms and Conditions</span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-navy-700/75">
                  <input
                    type="checkbox"
                    checked={form.acceptPrivacyPolicy}
                    onChange={update('acceptPrivacyPolicy')}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-900/20 text-brand-500 focus:ring-brand-200"
                  />
                  <span>I agree to the Asa Academy Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !form.acceptTerms || !form.acceptPrivacyPolicy || !passwordValid || !passwordsMatch}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create Account'}
                {!loading && <IconArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-navy-700/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
