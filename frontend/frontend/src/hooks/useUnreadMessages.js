import { useEffect, useRef, useState } from 'react'
import { getUnreadMessageCount } from '../lib/dashboardApi'
import { subscribeToEvent } from '../lib/socket'

const POLL_INTERVAL_MS = 30000
// Dispatched by the Messages page whenever it sends a message or marks a
// conversation read, so the sidebar badge updates immediately instead of
// waiting for the next poll.
export const MESSAGES_CHANGED_EVENT = 'asa:messages-changed'

// The 30s poll below is kept as a floor/fallback even now that a socket
// exists (see Realtime.md #13.3) — 'message.new'/'notification.new' make
// this badge update instantly in the common case, but the poll still
// covers a dropped/never-connected socket exactly as it always has.
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
    const unsubMessage = subscribeToEvent('message.new', refresh)
    const unsubNotification = subscribeToEvent('notification.new', refresh)
    return () => {
      clearInterval(timerRef.current)
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh)
      unsubMessage()
      unsubNotification()
    }
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { unreadCount, refresh }
}
