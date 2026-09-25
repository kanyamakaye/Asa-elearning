import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import GoogleDivider from '../components/auth/GoogleDivider'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { IconAward, IconChevronLeft, IconEye, IconEyeOff, IconLock, IconMail } from '../components/icons'
import logo from '../assets/logo.png'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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
      showToast(t('auth.toast.codeSent', { email: maskedEmail || email }), { tone: 'info' })
      navigate('/verify-2fa', { state: { challengeId, maskedEmail, email, from: { pathname: from } } })
    } catch (err) {
      const message = err.message || t('auth.login.genericError')
      setError(message)
      showToast(message, { tone: 'error', title: t('auth.toast.loginFailedTitle') })
    } finally {
      setLoading(false)
    }
  }

  // google-login.md — a verified Google identity skips the 2FA challenge
  // entirely and signs the user in immediately.
  async function handleGoogleCredential(credential) {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle(credential)
      showToast(t('auth.toast.welcomeBack'), { tone: 'success' })
      navigate(from, { replace: true })
    } catch (err) {
      const message = err.message || t('auth.login.googleError')
      setError(message)
      showToast(message, { tone: 'error', title: t('auth.toast.loginFailedTitle') })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        badge={t('auth.brandPanel.loginBadge')}
        heading={
          <>
            {t('auth.brandPanel.loginHeadingStart')}{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-500 to-brand-500 bg-clip-text text-transparent">
              {t('auth.brandPanel.loginHeadingEnd')}
            </span>
          </>
        }
        description={t('auth.brandPanel.loginDescription')}
      />

      {/* Sign-in panel */}
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
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">
              Asa Academy
            </span>
          </Link>

          <Link
            to="/"
            className="mb-6 hidden items-center gap-1.5 text-xs font-semibold text-navy-700/55 hover:text-brand-500 dark:text-navy-100/55 lg:inline-flex"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            {t('auth.backToHome')}
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-navy-700/45 dark:text-navy-100/45">
            <IconAward className="h-4 w-4 text-brand-500" />
            {t('auth.login.eyebrow')}
          </div>

          <div className="mt-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10 lg:mt-4 lg:p-0 lg:shadow-none lg:ring-0 dark:lg:bg-transparent dark:lg:ring-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">
              {t('auth.login.heading')}
            </h1>
            <p className="mt-2 text-sm text-navy-700/60 dark:text-navy-100/60">
              {t('auth.login.subheading')}
            </p>

            {justVerified && !error && (
              <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {t('auth.login.justVerified')}
              </div>
            )}
            {justResetPassword && !error && (
              <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {t('auth.login.justResetPassword')}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.fields.email')}</span>
                <div className="relative mt-2">
                  <IconMail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-navy-900/10 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35 dark:focus:ring-brand-500/20"
                  />
                </div>
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('auth.fields.password')}</span>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative mt-2">
                  <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-700/35 dark:text-navy-100/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-navy-900/10 bg-white py-3 pl-11 pr-11 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35 dark:focus:ring-brand-500/20"
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
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {loading ? t('auth.login.submitting') : t('auth.login.submit')}
              </button>
            </form>

            <GoogleDivider />
            <div className={googleLoading ? 'pointer-events-none opacity-60' : ''}>
              <GoogleSignInButton onCredential={handleGoogleCredential} text="signin_with" />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-navy-700/60 dark:text-navy-100/60">
            {t('auth.login.noAccount')}{' '}
            <Link to="/signup" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
