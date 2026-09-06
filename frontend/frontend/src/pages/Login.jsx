import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconAward, IconChevronLeft, IconEye, IconEyeOff, IconLock, IconMail, IconStar } from '../components/icons'
import logo from '../assets/logo.png'

const stats = [
  { value: '500+', label: 'Courses' },
  { value: '50k+', label: 'Students' },
  { value: '200+', label: 'Instructors' },
  { value: '98%', label: 'Completion rate' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to log in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
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
            Trusted by 50,000+ learners worldwide
          </div>
          <h2 className="animate-fade-up mt-6 text-3xl font-extrabold leading-[1.15] tracking-tight text-white [animation-delay:100ms]">
            Learn without limits,{' '}
            <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-brand-500 bg-clip-text text-transparent">
              grow with Asa Academy
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-100/70">
            Courses, live classes, quizzes, assignments, progress tracking, and
            verified certificates &mdash; all in one place.
          </p>
        </div>

        <dl className="relative grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-bold text-white">{s.value}</dd>
              <div className="mt-1 text-xs text-navy-100/60">{s.label}</div>
            </div>
          ))}
        </dl>
      </div>

      {/* Sign-in panel */}
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
            <span className="font-display text-lg font-bold tracking-tight text-navy-900">
              Asa Academy
            </span>
          </Link>

          <Link
            to="/"
            className="mb-6 hidden items-center gap-1.5 text-xs font-semibold text-navy-700/55 hover:text-brand-500 lg:inline-flex"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-navy-700/45">
            <IconAward className="h-4 w-4 text-brand-500" />
            Sign in to your workspace
          </div>

          <div className="mt-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 lg:mt-4 lg:p-0 lg:shadow-none lg:ring-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-navy-700/60">
              Log in to continue your learning journey.
            </p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-navy-900">Email address</span>
                <div className="relative mt-2">
                  <IconMail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-navy-900/10 py-3 pl-11 pr-4 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-900">Password</span>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-brand-500 hover:text-navy-900"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-2">
                  <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
              >
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-navy-700/60">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-500 hover:text-navy-900">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
