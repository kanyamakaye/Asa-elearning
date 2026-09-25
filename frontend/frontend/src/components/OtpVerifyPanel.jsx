import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { IconArrowRight, IconMail, IconRefresh } from './icons'

// Shared 6-digit verification UI for every OTP-by-email flow (registration,
// login 2FA, instructor activation) — see Authentication.md §10/§17. Keeps
// the resend-cooldown countdown and error handling in one place instead of
// re-implementing it per page.
export default function OtpVerifyPanel({
  heading,
  description,
  email,
  onVerify,
  onResend,
  resendCooldownSeconds = 60,
  verifyLabel,
}) {
  const { t } = useLanguage()
  const { showToast } = useToast()
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
      const message = err.message || t('auth.otp.verifyError')
      setError(message)
      showToast(message, { tone: 'error' })
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
      const message = t('auth.otp.resendSuccess')
      setInfo(message)
      showToast(message, { tone: 'info' })
      setCooldown(resendCooldownSeconds)
      setCode('')
      inputRef.current?.focus()
    } catch (err) {
      setError(err.message || t('auth.otp.resendError'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300">
        <IconMail className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">
        {heading || t('auth.otp.defaultHeading')}
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-navy-700/60 dark:text-navy-100/60">
        {description || (
          <>
            {t('auth.otp.sentTo')}{' '}
            {email ? (
              <span className="font-semibold text-navy-900 dark:text-white">{email}</span>
            ) : (
              t('auth.otp.yourEmail')
            )}
            .
          </>
        )}
      </p>

      <form onSubmit={handleVerify} className="mt-8">
        <label className="block">
          <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.otp.inputLabel')}</span>
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
            className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-navy-900 placeholder:text-navy-700/20 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/20 dark:focus:ring-brand-500/20"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
        )}
        {info && !error && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{info}</div>
        )}

        <button
          type="submit"
          disabled={verifying || code.length !== 6}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          {verifying ? t('auth.otp.verifying') : verifyLabel || t('auth.otp.defaultVerifyLabel')}
          {!verifying && <IconArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-navy-700/60 dark:text-navy-100/60">
        {t('auth.otp.didNotReceive')}{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="inline-flex items-center gap-1.5 font-semibold text-brand-500 hover:text-navy-900 disabled:cursor-not-allowed disabled:text-navy-700/40 dark:hover:text-white dark:disabled:text-navy-100/40"
        >
          <IconRefresh className="h-3.5 w-3.5" />
          {resending
            ? t('auth.otp.sending')
            : cooldown > 0
              ? t('auth.otp.resendWithCooldown', { seconds: cooldown })
              : t('auth.otp.resend')}
        </button>
      </div>
    </div>
  )
}
