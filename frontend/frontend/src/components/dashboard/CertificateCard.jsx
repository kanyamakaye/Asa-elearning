import { IconArrowRight, IconAward } from '../icons'

export default function CertificateCard({ certificate }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
        <IconAward className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-navy-900">{certificate.course__title ?? certificate.course_title}</h4>
        <p className="mt-0.5 text-xs text-navy-700/50">
          {certificate.certificate_number} &middot; Issued{' '}
          {certificate.issue_date ? new Date(certificate.issue_date).toLocaleDateString() : '—'}
        </p>
      </div>
      <a
        href={`/verify-certificate?code=${certificate.verification_code}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-500 hover:text-navy-900"
      >
        Verify
        <IconArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
