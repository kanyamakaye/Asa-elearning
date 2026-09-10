import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OtpVerifyPanel from '../components/OtpVerifyPanel'
import { IconChevronLeft, IconLock } from '../components/icons'
import logo from '../assets/logo.png'

export default function Verify2FA() {
  const { completeLogin, resendOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const challengeId = location.state?.challengeId
  const maskedEmail = location.state?.maskedEmail
  const email = location.state?.email
  const from = location.state?.from?.pathname || '/dashboard'

  async function handleVerify(otp) {
    await completeLogin(challengeId, otp)
    navigate(from, { replace: true })
  }

  async function handleResend() {
    if (!email) throw new Error('Please log in again to request a new code.')
    await resendOtp(email, 'login_2fa')
  }

  if (!challengeId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center">
        <p className="text-sm text-navy-700/60">Your sign-in session has expired. Please log in again.</p>
        <Link to="/login" className="font-semibold text-brand-500 hover:text-navy-900">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-navy-900">Asa Academy</span>
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8">
          <OtpVerifyPanel
            heading="Two-Factor Authentication"
            description={
              <>
                For your security, we&apos;ve sent a code to your registered email address
                {maskedEmail ? <> (<span className="font-semibold text-navy-900">{maskedEmail}</span>)</> : null}.
              </>
            }
            onVerify={handleVerify}
            onResend={handleResend}
            verifyLabel="Verify & Continue"
          />
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-navy-700/45">
          <IconLock className="h-3.5 w-3.5" />
          This extra step keeps your Asa Academy account secure.
        </p>
        <Link
          to="/login"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-700/55 hover:text-brand-500"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
