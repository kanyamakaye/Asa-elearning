import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OtpVerifyPanel from '../components/OtpVerifyPanel'
import { IconChevronLeft } from '../components/icons'
import logo from '../assets/logo.png'

export default function VerifyEmail() {
  const { verifyEmail, verifyInstructorEmail, resendOtp } = useAuth()
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center">
        <p className="text-sm text-navy-700/60">
          We couldn&apos;t find an email to verify. Please start from registration again.
        </p>
        <Link to="/signup" className="font-semibold text-brand-500 hover:text-navy-900">
          Back to sign up
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
            heading={isInstructor ? 'Verify Your Instructor Account' : 'Verify Your Email'}
            email={email}
            onVerify={handleVerify}
            onResend={handleResend}
            verifyLabel={redirecting ? 'Redirecting…' : 'Verify'}
          />
        </div>

        <Link
          to={isInstructor ? '/login' : '/signup'}
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-700/55 hover:text-brand-500"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {isInstructor ? 'Back to login' : 'Back to sign up'}
        </Link>
      </div>
    </div>
  )
}
