import { API_BASE_URL } from './api'

/** Real-time transport for Messaging + Notifications — see Realtime.md.
 * One WebSocket per logged-in session (matches the backend's one
 * connection/one group per user — Realtime.md #7), reconnected with
 * exponential backoff. Every consumer of this module (useUnreadMessages,
 * NotificationPanel, MessagesInbox) subscribes to an event name and stays
 * on its existing polling/fetch-on-mount behavior regardless of whether the
 * socket is connected — this is a progressive enhancement, not a
 * replacement (see Realtime.md #13.3). */

// http(s)://host:port/api/v1 -> ws(s)://host:port/ws/notifications/ — the
// realtime app's WebSocket route lives at the ASGI root, not under /api/v1
// (see backend/realtime/routing.py), since Channels' URLRouter is a
// separate namespace from Django's own ROOT_URLCONF.
function wsUrl(token) {
  const httpBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  const wsBase = httpBase.replace(/^http/, 'ws')
  return `${wsBase}/ws/notifications/?token=${encodeURIComponent(token)}`
}

function getAccessToken() {
  try {
    const raw = localStorage.getItem('asa_tokens')
    return raw ? JSON.parse(raw)?.access ?? null : null
  } catch {
    return null
  }
}

const listeners = new Set() // (event, data) => void
const MIN_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30000

let ws = null
let backoffMs = MIN_BACKOFF_MS
let reconnectTimer = null
let manuallyClosed = false

function notify(event, data) {
  listeners.forEach((fn) => fn(event, data))
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS)
    connectSocket()
  }, backoffMs)
}

/** Opens the socket if a token is available and one isn't already open/
 * opening. Safe to call repeatedly (e.g. from multiple mounting components)
 * — it's a no-op once connected. Called once at app boot (see main.jsx) and
 * again on login (AuthContext has no token-refresh flow yet, so "the
 * current token at connect time" is as fresh as this app can offer). */
export function connectSocket() {
  clearTimeout(reconnectTimer)
  const token = getAccessToken()
  if (!token) return
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  manuallyClosed = false
  ws = new WebSocket(wsUrl(token))

  ws.onopen = () => {
    backoffMs = MIN_BACKOFF_MS
  }

  ws.onmessage = (e) => {
    let parsed
    try {
      parsed = JSON.parse(e.data)
    } catch {
      return
    }
    if (parsed?.event) notify(parsed.event, parsed.data)
  }

  ws.onclose = () => {
    ws = null
    if (!manuallyClosed) scheduleReconnect()
  }

  ws.onerror = () => {
    // onclose always fires right after onerror for a WebSocket — reconnect
    // is scheduled there, nothing additional to do here.
  }
}

/** Called on logout — stops reconnect attempts and closes any open socket
 * so a signed-out session doesn't keep trying to authenticate. */
export function disconnectSocket() {
  manuallyClosed = true
  clearTimeout(reconnectTimer)
  backoffMs = MIN_BACKOFF_MS
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }
}

/** Subscribe to one event name ('message.new', 'notification.new', etc. —
 * see Realtime.md #11 for the catalog). Returns an unsubscribe function,
 * meant to be returned directly from a useEffect. */
export function subscribeToEvent(eventName, callback) {
  function handler(event, data) {
    if (event === eventName) callback(data)
  }
  listeners.add(handler)
  return () => listeners.delete(handler)
}
