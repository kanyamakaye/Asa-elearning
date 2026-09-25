import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import OtpVerifyPanel from '../components/OtpVerifyPanel'
import { IconChevronLeft } from '../components/icons'
import logo from '../assets/logo.png'

export default function VerifyEmail() {
  const { verifyEmail, verifyInstructorEmail, resendOtp } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  const isInstructor = params.get('flow') === 'instructor'
  const email = location.state?.email || params.get('email') || ''
  const [redirecting, setRedirecting] = useState(false)

  async function handleVerify(otp) {
    if (isInstructor) {
      await verifyInstructorEmail(email, otp)
    } else {
      await verifyEmail(email, otp)
    }
    setRedirecting(true)
    showToast(t('auth.toast.emailVerified'), { tone: 'success' })
    navigate('/login', {
      replace: true,
      state: { verified: true, email },
    })
  }

  async function handleResend() {
    await resendOtp(email, isInstructor ? 'instructor_activation' : 'registration')
  }

  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center dark:bg-navy-950">
        <p className="text-sm text-navy-700/60 dark:text-navy-100/60">{t('auth.verifyEmail.noEmail')}</p>
        <Link to="/signup" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
          {t('auth.verifyEmail.backToSignUp')}
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
            heading={isInstructor ? t('auth.verifyEmail.headingInstructor') : t('auth.verifyEmail.heading')}
            email={email}
            onVerify={handleVerify}
            onResend={handleResend}
            verifyLabel={redirecting ? t('auth.verifyEmail.redirecting') : t('auth.otp.defaultVerifyLabel')}
          />
        </div>

        <Link
          to={isInstructor ? '/login' : '/signup'}
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-700/55 hover:text-brand-500 dark:text-navy-100/55 dark:hover:text-brand-300"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {isInstructor ? t('auth.verify2fa.backToLogin') : t('auth.verifyEmail.backToSignUp')}
        </Link>
      </div>
    </div>
  )
}
