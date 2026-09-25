import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import PasswordStrengthChecklist from '../components/auth/PasswordStrengthChecklist'
import { PASSWORD_RULES } from '../lib/passwordRules'
import { IconArrowRight, IconEye, IconEyeOff, IconLock } from '../components/icons'
import logo from '../assets/logo.png'

// Authentication.md §19 — "/instructor/activate?token=<token>". An Admin-
// created Instructor lands here from their invitation email to set their
// own password; the Admin never sees or sets it.
export default function InstructorActivate() {
  const { activateInstructor } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(password))
  const passwordsMatch = password.length > 0 && password === confirmPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t('auth.register.passwordsDontMatch'))
      return
    }
    setLoading(true)
    try {
      const data = await activateInstructor(token, password, confirmPassword)
      showToast(t('auth.toast.instructorActivated'), { tone: 'success' })
      navigate('/verify-email?flow=instructor', { state: { email: data.email } })
    } catch (err) {
      const message = err.message || t('auth.instructorActivate.genericError')
      setError(message)
      showToast(message, { tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center dark:bg-navy-950">
        <p className="text-sm text-navy-700/60 dark:text-navy-100/60">
          {t('auth.instructorActivate.missingToken')}
        </p>
        <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
          {t('auth.verify2fa.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        badge={t('auth.instructorActivate.badge')}
        heading={
          <>
            {t('auth.instructorActivate.headingStart')}{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-500 to-brand-500 bg-clip-text text-transparent">
              {t('auth.instructorActivate.headingEnd')}
            </span>
          </>
        }
        description={t('auth.instructorActivate.description')}
      />

      <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12 dark:bg-navy-950 lg:bg-white dark:lg:bg-navy-950">
        <div className="animate-fade-up w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">Asa Academy</span>
          </Link>

          <div className="mt-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10 lg:mt-4 lg:p-0 lg:shadow-none lg:ring-0 dark:lg:bg-transparent dark:lg:ring-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('auth.instructorActivate.heading')}</h1>
            <p className="mt-2 text-sm text-navy-700/60 dark:text-navy-100/60">{t('auth.instructorActivate.subheading')}</p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.fields.password')}</span>
                <div className="relative mt-2">
                  <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setTouched(true)}
                    placeholder={t('auth.atLeast8Chars')}
                    className="w-full rounded-xl border border-navy-900/10 bg-white py-3 pl-11 pr-11 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-700/40 hover:text-navy-700 dark:text-navy-100/40 dark:hover:text-navy-100"
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? <IconEyeOff className="h-4.5 w-4.5" /> : <IconEye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {touched && <PasswordStrengthChecklist password={password} />}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.register.confirmPassword')}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 dark:bg-white/5 dark:text-white ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-400/50'
                      : 'border-navy-900/10 focus:border-brand-400 focus:ring-brand-100 dark:border-white/15'
                  }`}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{t('auth.register.passwordsDontMatch')}</p>
                )}
              </label>

              <button
                type="submit"
                disabled={loading || !passwordValid || !passwordsMatch}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {loading ? t('auth.instructorActivate.activating') : t('auth.instructorActivate.continue')}
                {!loading && <IconArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
