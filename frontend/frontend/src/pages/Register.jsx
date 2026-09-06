import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconEye, IconEyeOff, IconLock, IconMail } from '../components/icons'
import logo from '../assets/logo.png'

const userTypes = [
  { value: 'student', label: 'I want to learn' },
  { value: 'instructor', label: 'I want to teach' },
]

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
    userType: 'student',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-navy-900">Asa Academy</span>
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Create your account</h1>
          <p className="mt-2 text-sm text-navy-700/60">
            Join Asa Academy and start learning today &mdash; it&apos;s free.
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, userType: t.value }))}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ring-1 transition-colors ${
                    form.userType === t.value
                      ? 'bg-navy-900 text-white ring-navy-900'
                      : 'text-navy-700 ring-navy-900/10 hover:bg-navy-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

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
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-navy-900">Confirm password</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={form.passwordConfirm}
                onChange={update('passwordConfirm')}
                className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
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
  )
}
