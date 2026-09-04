import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../lib/dashboardApi'
import { timeAgo } from '../../components/dashboard/RecentActivity'
import { IconBell, IconCheck } from '../../components/icons'

export default function NotificationsList() {
  const { accessToken } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    listNotifications(accessToken)
      .then((data) => setNotifications(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Notifications</h1>
          <p className="mt-1 text-sm text-navy-700/55">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllNotificationsRead(accessToken).then(load)}
            className="text-sm font-semibold text-brand-500 hover:text-navy-900"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
      ) : notifications.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-navy-700/45 ring-1 ring-navy-900/8">
          No notifications yet.
        </p>
      ) : (
        <div className="divide-y divide-navy-900/6 rounded-2xl bg-white ring-1 ring-navy-900/8">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 p-4 ${n.is_read ? '' : 'bg-brand-50/40'}`}>
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700/60">
                <IconBell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                <p className="mt-0.5 text-sm text-navy-700/60">{n.message}</p>
                <p className="mt-1 text-xs text-navy-700/40">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => markNotificationRead(n.id, accessToken).then(load)}
                  className="shrink-0 rounded-full p-1.5 text-navy-700/40 hover:bg-navy-50 hover:text-brand-500"
                  aria-label="Mark as read"
                >
                  <IconCheck className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
