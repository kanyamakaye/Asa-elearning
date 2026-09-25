import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { checkInLiveClass, getLiveClass } from '../../services/liveClassService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Alert from '../../components/ui/Alert'
import { IconChevronLeft } from '../../components/icons'

const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js'

function loadJitsiScript() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve()
  const existing = document.querySelector(`script[src="${JITSI_SCRIPT_SRC}"]`)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = JITSI_SCRIPT_SRC
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

/** Full-screen, distraction-free video room for an IN_APP live class —
 * embeds Jitsi's public meet.jit.si server via its IFrame API (see
 * live-classes/models.py's jitsi_room field). meet.jit.si has no access
 * control of its own; the backend only ever reveals jitsi_room to the
 * instructor and enrolled students (LiveSessionViewSet.get_queryset), so
 * that unguessable room name is what actually keeps this private. */
export default function LiveClassRoom() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const apiRef = useRef(null)

  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getLiveClass(id)
      .then((data) => {
        if (cancelled) return
        if (data.meeting_platform !== 'in_app' || !data.jitsi_room) {
          setError(t('dashboardStudent.liveClassRoom.noInAppRoom'))
          return
        }
        setSession(data)
        checkInLiveClass(id).catch(() => {})
      })
      .catch((err) => !cancelled && setError(err.message || t('dashboardStudent.liveClassRoom.unableToLoad')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, t])

  useEffect(() => {
    if (!session || !containerRef.current) return undefined
    let disposed = false

    loadJitsiScript()
      .then(() => {
        if (disposed || !containerRef.current) return
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: session.jitsi_room,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: user?.full_name || user?.username || t('dashboardStudent.liveClassRoom.defaultDisplayName') },
          configOverwrite: { prejoinPageEnabled: true },
          interfaceConfigOverwrite: { MOBILE_APP_PROMO: false },
        })
        apiRef.current = api
        api.on('readyToClose', () => navigate('/dashboard/live-classes', { replace: true }))
      })
      .catch(() => setError(t('dashboardStudent.liveClassRoom.unableToLoadVideoRoom')))

    return () => {
      disposed = true
      apiRef.current?.dispose()
      apiRef.current = null
    }
  }, [session, user, navigate, t])

  if (loading) return <LoadingSpinner label={t('dashboardStudent.liveClassRoom.loading')} className="min-h-screen" />

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <Alert tone="error">{error}</Alert>
        <Link to="/dashboard/live-classes" className="text-sm font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
          {t('dashboardStudent.liveClassRoom.backToLiveClasses')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-navy-950">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-navy-900 px-4 py-2.5">
        <Link
          to="/dashboard/live-classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-100/70 hover:text-white"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {t('dashboardStudent.liveClassRoom.leave')}
        </Link>
        <span className="truncate text-sm font-semibold text-white">{session?.title}</span>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1" />
    </div>
  )
}
