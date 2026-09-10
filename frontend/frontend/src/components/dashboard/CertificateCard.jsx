import { IconArrowRight, IconAward } from '../icons'

export default function CertificateCard({ certificate }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ${certificate.is_expired ? 'ring-red-200' : 'ring-navy-900/8'}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${certificate.is_expired ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'}`}>
        <IconAward className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-navy-900">{certificate.course__title ?? certificate.course_title}</h4>
        <p className="mt-0.5 text-xs text-navy-700/50">
          {certificate.certificate_number} &middot; Issued{' '}
          {certificate.issue_date ? new Date(certificate.issue_date).toLocaleDateString() : '—'}
        </p>
        {certificate.expires_at && (
          <p className={`mt-0.5 text-xs font-semibold ${certificate.is_expired ? 'text-red-600' : 'text-navy-700/45'}`}>
            {certificate.is_expired ? 'Expired' : 'Expires'} {new Date(certificate.expires_at).toLocaleDateString()}
            {certificate.renewal_count > 0 && ` · renewed ${certificate.renewal_count}x`}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {certificate.certificate_file && (
          <a
            href={certificate.certificate_file}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-brand-500"
          >
            View PDF
            <IconArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
        <a
          href={`/verify-certificate?code=${certificate.verification_code}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-navy-900"
        >
          Verify
          <IconArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
