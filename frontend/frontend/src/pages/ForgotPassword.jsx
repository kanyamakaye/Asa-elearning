import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { PASSWORD_RULES } from '../lib/passwordRules'
import PasswordStrengthChecklist from '../components/auth/PasswordStrengthChecklist'
import { IconArrowRight, IconEye, IconEyeOff, IconLock, IconMail, IconRefresh } from '../components/icons'
import logo from '../assets/logo.png'

const RESEND_COOLDOWN_SECONDS = 60

// Authentication.md §24 — password reset is OTP-based (a 6-digit code
// emailed to the user), not a clickable link. This page has two steps:
// request the code, then submit it together with a new password.
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touchedPassword, setTouchedPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const otpInputRef = useRef(null)

  useEffect(() => {
    if (step === 'reset') otpInputRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(newPassword))
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  async function requestCode(e) {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiFetch('/auth/password-reset/', { method: 'POST', body: { email } })
      setStep('reset')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return
    setError('')
    setInfo('')
    setResending(true)
    try {
      await apiFetch('/auth/resend-otp/', { method: 'POST', body: { email, purpose: 'password_reset' } })
      setInfo('A new reset code has been sent to your email.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setOtp('')
      otpInputRef.current?.focus()
    } catch (err) {
      setError(err.message || 'Please wait before requesting another code.')
    } finally {
      setResending(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await apiFetch('/auth/password-reset/confirm/', {
        method: 'POST',
        body: { email, otp, new_password: newPassword },
      })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err.message || 'That code is invalid or has expired. Please try again or request a new one.')
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
          {step === 'request' ? (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Forgot your password?</h1>
              <p className="mt-2 text-sm text-navy-700/60">
                Enter your email and we&apos;ll send you a 6-digit code to reset it.
              </p>

              {error && (
                <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
              )}

              <form onSubmit={requestCode} className="mt-8 grid gap-5">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send Reset Code'}
                  {!loading && <IconArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Reset your password</h1>
              <p className="mt-2 text-sm leading-relaxed text-navy-700/60">
                If an account exists for <span className="font-semibold text-navy-900">{email}</span>, we&apos;ve sent
                a 6-digit code to that address. Enter it below along with your new password.
              </p>

              {error && (
                <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
              )}
              {info && !error && (
                <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{info}</div>
              )}

              <form onSubmit={handleReset} className="mt-8 grid gap-5">
                <label className="block">
                  <span className="text-sm font-semibold text-navy-900">6-digit verification code</span>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3.5 text-center text-xl font-bold tracking-[0.4em] text-navy-900 placeholder:text-navy-700/20 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-navy-900">New password</span>
                  <div className="relative mt-2">
                    <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  {touchedPassword && <PasswordStrengthChecklist password={newPassword} />}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-navy-900">Confirm new password</span>
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
                  disabled={loading || otp.length !== 6 || !passwordValid || !passwordsMatch}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                  {!loading && <IconArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-navy-700/60">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-500 hover:text-navy-900 disabled:cursor-not-allowed disabled:text-navy-700/40"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  {resending ? 'Sending…' : cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend Code'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-navy-700/60">
          Remembered it after all?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
