import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import { IconAward, IconChevronLeft, IconEye, IconEyeOff, IconLock, IconMail } from '../components/icons'
import logo from '../assets/logo.png'

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
  const justVerified = location.state?.verified
  const justResetPassword = location.state?.passwordReset

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Step 1 of Authentication.md's login flow — valid credentials issue a
      // 2FA challenge, not a session. The OTP screen completes the sign-in.
      const { challengeId, maskedEmail } = await login(email, password)
      navigate('/verify-2fa', { state: { challengeId, maskedEmail, email, from: { pathname: from } } })
    } catch (err) {
      setError(err.message || 'Unable to log in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        badge="Trusted by 50,000+ learners worldwide"
        heading={
          <>
            Learn without limits,{' '}
            <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-brand-500 bg-clip-text text-transparent">
              grow with Asa Academy
            </span>
          </>
        }
        description="Courses, live classes, quizzes, assignments, progress tracking, and verified certificates — all in one place."
      />

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

            {justVerified && !error && (
              <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Your email has been verified. You can now sign in.
              </div>
            )}
            {justResetPassword && !error && (
              <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Your password has been reset. You can now sign in with your new password.
              </div>
            )}

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
