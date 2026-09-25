import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import OtpVerifyPanel from '../components/OtpVerifyPanel'
import { IconChevronLeft, IconLock } from '../components/icons'
import logo from '../assets/logo.png'

export default function Verify2FA() {
  const { completeLogin, resendOtp } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const challengeId = location.state?.challengeId
  const maskedEmail = location.state?.maskedEmail
  const email = location.state?.email
  const from = location.state?.from?.pathname || '/dashboard'

  async function handleVerify(otp) {
    const user = await completeLogin(challengeId, otp)
    showToast(t('auth.toast.welcomeBackName', { name: user?.first_name || user?.username || '' }), { tone: 'success' })
    navigate(from, { replace: true })
  }

  async function handleResend() {
    if (!email) throw new Error(t('auth.verify2fa.resendNeedsLogin'))
    await resendOtp(email, 'login_2fa')
  }

  if (!challengeId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center dark:bg-navy-950">
        <p className="text-sm text-navy-700/60 dark:text-navy-100/60">{t('auth.verify2fa.sessionExpired')}</p>
        <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
          {t('auth.verify2fa.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12 dark:bg-navy-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">Asa Academy</span>
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10">
          <OtpVerifyPanel
            heading={t('auth.verify2fa.heading')}
            description={
              <>
                {t('auth.verify2fa.description')}
                {maskedEmail ? <> (<span className="font-semibold text-navy-900 dark:text-white">{maskedEmail}</span>)</> : null}.
              </>
            }
            onVerify={handleVerify}
            onResend={handleResend}
            verifyLabel={t('auth.verify2fa.verifyLabel')}
          />
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-navy-700/45 dark:text-navy-100/45">
          <IconLock className="h-3.5 w-3.5" />
          {t('auth.verify2fa.securityNote')}
        </p>
        <Link
          to="/login"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-700/55 hover:text-brand-500 dark:text-navy-100/55 dark:hover:text-brand-300"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {t('auth.verify2fa.backToLogin')}
        </Link>
      </div>
    </div>
  )
}
