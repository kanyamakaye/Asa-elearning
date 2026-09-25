import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import GoogleDivider from '../components/auth/GoogleDivider'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PasswordStrengthChecklist from '../components/auth/PasswordStrengthChecklist'
import { PASSWORD_RULES } from '../lib/passwordRules'
import { IconArrowRight, IconChevronLeft, IconEye, IconEyeOff, IconLock, IconMail } from '../components/icons'
import logo from '../assets/logo.png'

export default function Register() {
  const { register, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(form.password))
  const passwordsMatch = form.password.length > 0 && form.password === form.passwordConfirm

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError(t('auth.register.passwordsDontMatch'))
      return
    }
    if (!form.acceptTerms || !form.acceptPrivacyPolicy) {
      setError(t('auth.register.mustAcceptTerms'))
      return
    }

    setLoading(true)
    try {
      const data = await register(form)
      showToast(t('auth.toast.accountCreated'), { tone: 'success' })
      navigate('/verify-email', { state: { email: data?.email || form.email } })
    } catch (err) {
      const message = err.message || t('auth.register.genericError')
      setError(message)
      showToast(message, { tone: 'error', title: t('auth.toast.registerFailedTitle') })
    } finally {
      setLoading(false)
    }
  }

  // google-login.md — a Google account is created already-verified and
  // already-active, so unlike password registration this signs the learner
  // straight in instead of sending them to the OTP verification screen.
  async function handleGoogleCredential(credential) {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle(credential)
      showToast(t('auth.toast.welcomeBack'), { tone: 'success' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.message || t('auth.register.googleError')
      setError(message)
      showToast(message, { tone: 'error', title: t('auth.toast.registerFailedTitle') })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        badge={t('auth.brandPanel.signupBadge')}
        heading={
          <>
            {t('auth.brandPanel.signupHeadingStart')}{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-500 to-brand-500 bg-clip-text text-transparent">
              {t('auth.brandPanel.signupHeadingEnd')}
            </span>
          </>
        }
        description={t('auth.brandPanel.signupDescription')}
      />

      <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12 dark:bg-navy-950 lg:bg-white dark:lg:bg-navy-950">
        <div className="animate-fade-up w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700/55 hover:text-brand-500 dark:text-navy-100/55 lg:hidden"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            {t('auth.backToHome')}
          </Link>

          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">Asa Academy</span>
          </Link>

          <Link
            to="/"
            className="mb-6 hidden items-center gap-1.5 text-xs font-semibold text-navy-700/55 hover:text-brand-500 dark:text-navy-100/55 lg:inline-flex"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            {t('auth.backToHome')}
          </Link>

          <div className="mt-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10 lg:mt-4 lg:p-0 lg:shadow-none lg:ring-0 dark:lg:bg-transparent dark:lg:ring-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('auth.register.heading')}</h1>
            <p className="mt-2 text-sm text-navy-700/60 dark:text-navy-100/60">
              {t('auth.register.subheading')}
            </p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.register.firstName')}</span>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={update('firstName')}
                    className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.register.lastName')}</span>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={update('lastName')}
                    className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.register.username')}</span>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={update('username')}
                  className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.fields.email')}</span>
                <div className="relative mt-2">
                  <IconMail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-navy-900/10 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.fields.password')}</span>
                <div className="relative mt-2">
                  <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update('password')}
                    onFocus={() => setTouchedPassword(true)}
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
                {touchedPassword && <PasswordStrengthChecklist password={form.password} />}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.register.confirmPassword')}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.passwordConfirm}
                  onChange={update('passwordConfirm')}
                  className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 dark:bg-white/5 dark:text-white ${
                    form.passwordConfirm && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-400/50'
                      : 'border-navy-900/10 focus:border-brand-400 focus:ring-brand-100 dark:border-white/15'
                  }`}
                />
                {form.passwordConfirm && !passwordsMatch && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{t('auth.register.passwordsDontMatch')}</p>
                )}
              </label>

              <div className="space-y-2.5 border-t border-navy-900/8 pt-5 dark:border-white/10">
                <label className="flex items-start gap-2.5 text-sm text-navy-700/75 dark:text-navy-100/75">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={update('acceptTerms')}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-900/20 text-brand-500 focus:ring-brand-200 dark:border-white/25 dark:bg-white/5"
                  />
                  <span>{t('auth.register.acceptTerms')}</span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-navy-700/75 dark:text-navy-100/75">
                  <input
                    type="checkbox"
                    checked={form.acceptPrivacyPolicy}
                    onChange={update('acceptPrivacyPolicy')}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-900/20 text-brand-500 focus:ring-brand-200 dark:border-white/25 dark:bg-white/5"
                  />
                  <span>{t('auth.register.acceptPrivacy')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !form.acceptTerms || !form.acceptPrivacyPolicy || !passwordValid || !passwordsMatch}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {loading ? t('auth.register.submitting') : t('auth.register.submit')}
                {!loading && <IconArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <GoogleDivider />
            <div className={googleLoading ? 'pointer-events-none opacity-60' : ''}>
              <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-navy-700/60 dark:text-navy-100/60">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
              {t('auth.register.logIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
