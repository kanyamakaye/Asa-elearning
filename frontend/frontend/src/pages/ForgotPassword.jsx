import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { IconCheck, IconMail } from '../components/icons'
import logo from '../assets/logo.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiFetch('/auth/password-reset/', { method: 'POST', body: { email } })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50/40 px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-tight text-navy-900">Asa Academy</span>
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8">
          {sent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                <IconCheck className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-xl font-bold text-navy-900">Check your email</h1>
              <p className="mt-2 text-sm text-navy-700/60">
                If an account exists for <span className="font-semibold">{email}</span>, we&apos;ve
                sent a link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
                Forgot your password?
              </h1>
              <p className="mt-2 text-sm text-navy-700/60">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>

              {error && (
                <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
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
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
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
