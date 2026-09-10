import { useEffect, useRef, useState } from 'react'
import { getUnreadMessageCount } from '../lib/dashboardApi'

const POLL_INTERVAL_MS = 30000
// Dispatched by the Messages page whenever it sends a message or marks a
// conversation read, so the sidebar badge updates immediately instead of
// waiting for the next poll.
export const MESSAGES_CHANGED_EVENT = 'asa:messages-changed'

// The platform has no WebSocket/SSE infrastructure, so the Messages unread
// badge (dashboard nav + browser tab-adjacent UI) is kept fresh with simple
// polling instead — matches the app's existing plain request/response
// data-fetching pattern rather than introducing new realtime infra.
export default function useUnreadMessages(accessToken) {
  const [unreadCount, setUnreadCount] = useState(0)
  const timerRef = useRef(null)

  function refresh() {
    if (!accessToken) return
    getUnreadMessageCount(accessToken)
      .then((data) => setUnreadCount(data.unread_count ?? 0))
      .catch(() => {})
  }

  useEffect(() => {
    if (!accessToken) {
      setUnreadCount(0)
      return undefined
    }
    refresh()
    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS)
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh)
    return () => {
      clearInterval(timerRef.current)
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh)
    }
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { unreadCount, refresh }
}
