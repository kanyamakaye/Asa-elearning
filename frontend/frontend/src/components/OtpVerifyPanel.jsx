import { useEffect, useRef, useState } from 'react'
import { IconArrowRight, IconMail, IconRefresh } from './icons'

// Shared 6-digit verification UI for every OTP-by-email flow (registration,
// login 2FA, instructor activation) — see Authentication.md §10/§17. Keeps
// the resend-cooldown countdown and error handling in one place instead of
// re-implementing it per page.
export default function OtpVerifyPanel({
  heading = 'Verify Your Email',
  description,
  email,
  onVerify,
  onResend,
  resendCooldownSeconds = 60,
  verifyLabel = 'Verify',
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(resendCooldownSeconds)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setVerifying(true)
    try {
      await onVerify(code)
    } catch (err) {
      setError(err.message || 'The verification code is invalid or has expired. Please try again or request a new code.')
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return
    setError('')
    setInfo('')
    setResending(true)
    try {
      await onResend()
      setInfo('A new verification code has been sent to your email.')
      setCooldown(resendCooldownSeconds)
      setCode('')
      inputRef.current?.focus()
    } catch (err) {
      setError(err.message || 'Please wait before requesting another verification code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <IconMail className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-navy-900">{heading}</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-navy-700/60">
        {description || (
          <>
            We sent a verification code to{' '}
            {email ? <span className="font-semibold text-navy-900">{email}</span> : 'your email address'}.
          </>
        )}
      </p>

      <form onSubmit={handleVerify} className="mt-8">
        <label className="block">
          <span className="text-sm font-semibold text-navy-900">Enter your 6-digit verification code</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-navy-900 placeholder:text-navy-700/20 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
        )}
        {info && !error && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{info}</div>
        )}

        <button
          type="submit"
          disabled={verifying || code.length !== 6}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
        >
          {verifying ? 'Verifying…' : verifyLabel}
          {!verifying && <IconArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-navy-700/60">
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
    </div>
  )
}
