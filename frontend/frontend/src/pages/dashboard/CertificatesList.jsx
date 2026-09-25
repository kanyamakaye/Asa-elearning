import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { apiFetch } from '../../lib/api'
import { listCertificates, renewCertificate } from '../../lib/dashboardApi'
import CertificateCard from '../../components/dashboard/CertificateCard'
import Button from '../../components/ui/Button'

const MANAGER_ROLES = ['admin', 'instructor']

export default function CertificatesList() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const canManage = MANAGER_ROLES.includes(user?.user_type)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    listCertificates(accessToken)
      .then((data) => setCertificates(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(cert, status) {
    setBusyId(cert.id)
    try {
      await apiFetch(`/certificates/${cert.id}/`, { method: 'PATCH', body: { status }, token: accessToken })
      load()
    } finally {
      setBusyId(null)
    }
  }

  async function renew(cert) {
    setBusyId(cert.id)
    try {
      await renewCertificate(cert.id, accessToken)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{t('dashboardStudent.certificatesList.heading')}</h1>
        <p className="mt-1 text-sm text-navy-700/55 dark:text-navy-100/55">{t('dashboardStudent.certificatesList.certificateCount', { count: certificates.length })}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:text-navy-100/45 dark:ring-white/10">
          {t('dashboardStudent.certificatesList.noCertificates')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="space-y-2">
              <CertificateCard certificate={{ ...cert, course_title: cert.course_detail?.title }} />
              {canManage && (
                <div className="flex justify-end gap-2 px-1">
                  {cert.is_expired && (
                    <Button size="sm" variant="secondary" disabled={busyId === cert.id} onClick={() => renew(cert)}>
                      {t('dashboardStudent.certificatesList.renew')}
                    </Button>
                  )}
                  {cert.status === 'revoked' ? (
                    <Button size="sm" variant="secondary" disabled={busyId === cert.id} onClick={() => setStatus(cert, 'active')}>
                      {t('dashboardStudent.certificatesList.reactivate')}
                    </Button>
                  ) : (
                    <Button size="sm" variant="danger" disabled={busyId === cert.id} onClick={() => setStatus(cert, 'revoked')}>
                      {t('dashboardStudent.certificatesList.revoke')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
