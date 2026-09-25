import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../lib/dashboardApi'
import { subscribeToEvent } from '../../lib/socket'
import { timeAgo } from './RecentActivity'
import { IconBell, IconCheck } from '../icons'

export default function NotificationPanel() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!open || !accessToken) return
    setLoading(true)
    listNotifications(accessToken, { unread: 'true' })
      .then((data) => setNotifications(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, accessToken])

  // Live push (see Realtime.md #11) — updates the badge/list the moment a
  // notification arrives, whether or not the panel is currently open;
  // opening the panel still does its own authoritative fetch above.
  useEffect(() => {
    if (!accessToken) return undefined
    const unsubNew = subscribeToEvent('notification.new', (data) => {
      setNotifications((prev) => (prev.some((n) => n.id === data.id) ? prev : [data, ...prev]))
    })
    const unsubRead = subscribeToEvent('notification.read', (data) => {
      setNotifications((prev) => prev.filter((n) => n.id !== data.id))
    })
    return () => {
      unsubNew()
      unsubRead()
    }
  }, [accessToken])

  const unreadCount = notifications.length

  async function handleMarkAllRead() {
    await markAllNotificationsRead(accessToken).catch(() => {})
    setNotifications([])
  }

  async function handleMarkRead(id) {
    await markNotificationRead(id, accessToken).catch(() => {})
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-navy-700/60 hover:bg-navy-50 dark:text-navy-100/60 dark:hover:bg-white/5"
        aria-label={t('dashboardChrome.notifications.title')}
      >
        <IconBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <div className="flex items-center justify-between border-b border-navy-900/8 px-4 py-3 dark:border-white/10">
            <h3 className="text-sm font-bold text-navy-900 dark:text-white">{t('dashboardChrome.notifications.title')}</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="text-xs font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
                {t('dashboardChrome.notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-navy-700/45 dark:text-navy-100/45">{t('dashboardChrome.notifications.loading')}</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-navy-700/45 dark:text-navy-100/45">{t('dashboardChrome.notifications.caughtUp')}</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 border-b border-navy-900/6 px-4 py-3 last:border-0 dark:border-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-navy-700/60 dark:text-navy-100/60">{n.message}</p>
                    <p className="mt-1 text-[10px] text-navy-700/40 dark:text-navy-100/40">{timeAgo(n.created_at, t)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="mt-0.5 shrink-0 rounded-full p-1 text-navy-700/40 hover:bg-navy-50 hover:text-brand-500 dark:text-navy-100/40 dark:hover:bg-white/5"
                    aria-label={t('dashboardChrome.notifications.markAsRead')}
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
