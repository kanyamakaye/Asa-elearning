import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listCertificates } from '../../lib/dashboardApi'
import CertificateCard from '../../components/dashboard/CertificateCard'

export default function CertificatesList() {
  const { accessToken } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listCertificates(accessToken)
      .then((data) => !cancelled && setCertificates(data.results ?? data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [accessToken])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Certificates</h1>
        <p className="mt-1 text-sm text-navy-700/55">{certificates.length} certificate{certificates.length === 1 ? '' : 's'}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8">
          No certificates issued yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={{ ...cert, course_title: cert.course_detail?.title }} />
          ))}
        </div>
      )}
    </div>
  )
}
