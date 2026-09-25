import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { apiFetch } from '../lib/api'
import { IconAward, IconCheck, IconClose, IconSearch } from '../components/icons'

export default function VerifyCertificate() {
  const { t } = useLanguage()
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function verify(verificationCode) {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await apiFetch('/certificates/verify/', {
        method: 'POST',
        body: { verification_code: verificationCode },
      })
      setResult(data)
    } catch (err) {
      setError(err.message || t('public.verifyCertificate.genericError'))
    } finally {
      setLoading(false)
    }
  }

  // A shared verify link (e.g. from a printed certificate's QR code) should
  // check itself immediately instead of making the visitor click Verify again.
  useEffect(() => {
    const initial = params.get('code')
    if (initial) verify(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e) {
    e.preventDefault()
    verify(code)
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300">
          <IconAward className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('public.verifyCertificate.title')}</h1>
        <p className="mt-2 text-sm text-navy-700/60 dark:text-navy-100/60">
          {t('public.verifyCertificate.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 8F3C2A1B9D0E"
          className="flex-1 rounded-full border border-navy-900/10 bg-white px-5 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          <IconSearch className="h-4 w-4" />
          {loading ? t('public.verifyCertificate.checking') : t('public.verifyCertificate.verify')}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 text-center text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10">
          {result.valid ? (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <IconCheck className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{t('public.verifyCertificate.verified')}</p>
                <p className="mt-2 text-sm text-navy-800 dark:text-navy-100">
                  {t('public.verifyCertificate.issuedTo')}{' '}
                  <span className="font-semibold">{result.certificate.student.full_name}</span> {t('public.verifyCertificate.forCourse')}{' '}
                  <span className="font-semibold">{result.certificate.course_detail.title}</span>
                </p>
                <p className="mt-1 text-xs text-navy-700/50 dark:text-navy-100/50">
                  {t('public.verifyCertificate.certificateNumber', { number: result.certificate.certificate_number })} &middot;{' '}
                  {t('public.verifyCertificate.issued', { date: new Date(result.certificate.issue_date).toLocaleDateString() })}
                </p>
                {result.certificate.certificate_file && (
                  <a
                    href={result.certificate.certificate_file}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white"
                  >
                    {t('public.verifyCertificate.viewPdf')}
                    <IconAward className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : result.certificate ? (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
                <IconClose className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{result.detail}</p>
                <p className="mt-2 text-sm text-navy-800 dark:text-navy-100">
                  {t('public.verifyCertificate.issuedTo')}{' '}
                  <span className="font-semibold">{result.certificate.student.full_name}</span> {t('public.verifyCertificate.forCourse')}{' '}
                  <span className="font-semibold">{result.certificate.course_detail.title}</span>
                </p>
                <p className="mt-1 text-xs text-navy-700/50 dark:text-navy-100/50">
                  {t('public.verifyCertificate.certificateNumber', { number: result.certificate.certificate_number })} &middot;{' '}
                  {t('public.verifyCertificate.issued', { date: new Date(result.certificate.issue_date).toLocaleDateString() })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-navy-700/60 dark:text-navy-100/60">{result.detail}</p>
          )}
        </div>
      )}
    </div>
  )
}
