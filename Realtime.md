# ASA ACADEMY

## Real-Time (WebSocket) Notifications & Messaging

### Backend and Frontend Implementation Documentation

---

# 1. Objective

The platform currently has no push/real-time transport. Two features simulate freshness with plain HTTP:

```text
Unread messages badge  -> polls GET /messages/unread-count/ every 30 seconds
Notification bell       -> fetched once on mount, only refreshed on navigation
Open conversation        -> fetched once on mount, new messages need a manual refresh
```

See `frontend/frontend/src/hooks/useUnreadMessages.js`, which documents this explicitly in its own
header comment: *"The platform has no WebSocket/SSE infrastructure ... kept fresh with simple polling
instead."* This document is the plan for closing that gap.

The objective is to add a WebSocket transport and use it **only where it removes a real, felt delay**:

```text
1. Messaging   - new messages appear in an open conversation instantly, no refresh
2. Notifications - the bell/badge updates the moment a notification is created
```

Everything else in the platform (courses, quizzes, assignments, live classes, discussions, grading,
payments) keeps its existing plain request/response pattern. This is a scoped, additive feature, not a
rewrite of the app's data layer.

---

# 2. Scope

## 2.1 In scope (v1)

```text
Messaging
  - message.new         (a message is delivered to every open participant instantly)
  - conversation.updated (conversation list re-orders/shows preview without a refetch)

Notifications
  - notification.new     (bell badge increments, toast/inline banner optional)
  - notification.read    (badge decrements when read from another open tab)
```

## 2.2 Explicitly out of scope (v1)

```text
Live Classes  - sessions are external Zoom/Meet/Teams links (see course.md #31); there is no
                in-app video or chat surface to make "real-time," so there is nothing to socket yet.
                A future "who's currently in this session" presence indicator could reuse this same
                infrastructure, but it is not part of this rollout.
Discussions   - live-updating reply threads are a nice-to-have, not a felt gap today (students visit
                a thread, not stare at it waiting for replies). Candidate for v2 once the messaging/
                notification channel layer is proven in production.
Typing indicators, read receipts, presence ("online now") - not requested, add real complexity
                (short-lived state, more channel groups) for no requirement driving them yet.
Quiz/exam timers - these already run correctly as a client-side countdown against a server-issued
                end time; a socket adds no value and a dropped connection must never be able to
                affect a timed assessment.
```

Anything in 2.2 can be added later using the same infrastructure this document sets up — it is scoped
out for this rollout, not ruled out architecturally.

---

# 3. Technology Stack

## Backend (additions)

```text
channels              # ASGI consumers + routing, replaces plain WSGI for this app
channels-redis        # channel layer backend — required for more than one worker process
redis                 # already the standard channel-layer backing store; new docker-compose service
daphne                # ASGI server — replaces gunicorn as the container's entrypoint process
```

## Frontend (no new dependency required)

```text
Native browser WebSocket API, wrapped in one small module (src/lib/socket.js)
```

No client library (socket.io-client, etc.) is needed — Channels speaks plain WebSocket, and the app
already avoids adding dependencies it doesn't need (see the xlsx/jspdf choices elsewhere in the repo).

---

# 4. Why Channels + Daphne, Not a Separate Service

Two designs were considered:

```text
Option A (recommended): One Django app, ASGI end to end.
  - channels.routing.ProtocolTypeRouter serves BOTH plain HTTP (existing DRF views, unchanged)
    and WebSocket connections from the same process.
  - daphne replaces gunicorn as the backend container's process.
  - Single container, single Dockerfile change, no new backend service to deploy/monitor.

Option B: A second, separate real-time microservice (Node/Socket.IO or a second Django process)
  - Would need its own auth story, its own deployment, and a way to read the same Postgres data
    or duplicate it. Meaningfully more infrastructure for two features.
```

Option A is the recommended path: it fits the project's existing "one backend container" shape in
`docker-compose.yml`, reuses the same models/permissions/serializers, and every other part of this
document assumes it.

---

# 5. Overall Architecture

```text
                         React App
                               │
             ┌─────────────────┴─────────────────┐
             │                                     │
      Axios / REST (unchanged)              WebSocket (new)
             │                                     │
             ▼                                     ▼
     Django REST Framework               channels.routing.ProtocolTypeRouter
             │                                     │
             │                          ┌──────────┴──────────┐
             │                          │                     │
             │                 NotificationConsumer   (future consumers)
             │                          │
             │                          ▼
             │                 channels_redis channel layer
             │                          │
             └────────────┬─────────────┘
                           ▼
                      PostgreSQL   (Message / Notification rows — unchanged models)
                           │
                           ▼
                        Redis        (channel layer only — no durable data lives here)
```

Redis here is purely a pub/sub bus between Django processes/workers; Postgres remains the single
source of truth. If Redis is unavailable, the socket layer degrades — HTTP create/read of messages
and notifications keeps working exactly as it does today (see §12, Fallback Behavior).

---

# 6. Backend Application Structure

A new `realtime` app owns the transport (consumers, routing, the small helper that publishes events).
It does **not** own the `Message` or `Notification` models — those stay in `messaging` and
`notifications` respectively, matching the existing one-concern-per-app convention.

```text
backend/
│
├── realtime/
│   ├── __init__.py
│   ├── consumers.py      # NotificationConsumer (handles both notifications + messaging events —
│   │                      # see §8, one connection per user, not one per conversation)
│   ├── routing.py         # websocket_urlpatterns
│   ├── middleware.py      # JWTAuthMiddleware — authenticates the WS handshake (see §9)
│   ├── events.py          # publish_to_user(user_id, event) — the one function the rest of the
│   │                      # codebase calls; wraps channel_layer.group_send so callers never touch
│   │                      # Channels directly
│   └── tests.py
│
├── messaging/
│   └── views.py            # gains one call: realtime.events.publish_to_user(...) after saving
│                            # a Message — no model or serializer changes
│
├── notifications/
│   └── reminders.py         # gains the same one call after Notification.objects.create(...)
│
└── config/
    ├── asgi.py              # replaced with ProtocolTypeRouter (see §10)
    └── settings.py          # + CHANNEL_LAYERS, + 'channels' and 'realtime' in INSTALLED_APPS
```

---

# 7. Channel Group Model

One WebSocket connection per logged-in user (not one per conversation, not one per notification).
The client subscribes once on login and receives everything relevant to that user over the same
socket — simpler to manage on both ends than one connection per open conversation.

```text
Group name: user_{user_id}

A user is added to their own group on connect, removed on disconnect. No other group is needed for
v1's scope: message delivery is "deliver to every participant of the conversation," which resolves to
"publish to each participant's user_{id} group" — see §12.
```

```text
Group name: conversation_{conversation_id}   -- NOT used in v1

Considered and rejected for v1: it would let a client "watch" a conversation before joining, which
this app has no use case for (participants are fixed at conversation-creation time — see
messaging/models.py's ConversationParticipant). Revisit only if group conversations with dynamic
membership are added later.
```

---

# 8. Consumer Design

```python
# realtime/consumers.py  (illustrative — this is documentation, not the final diff)

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not self.scope['user'].is_authenticated:
            await self.close(code=4001)
            return
        self.group_name = f'user_{self.scope["user"].id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # No client -> server messages are required for v1 (read-only push channel).
    # A future "mark read over the socket" action would add a receive() handler here.

    async def push_event(self, event):
        # event == {'type': 'push_event', 'payload': {...}} — see §11 for payload shapes
        await self.send_json(event['payload'])
```

`push_event` is the Channels-required naming convention (the `type` key in a `group_send` payload maps
to a same-named method on the consumer, with dots replaced by underscores). Every event this app sends
uses `type: 'push_event'` and carries its real event name inside `payload.event` instead — this keeps
one consumer method instead of one per event type, and keeps the "what happened" logic out of the
transport layer.

---

# 9. Authentication on Connect

Browsers' native WebSocket API cannot send an `Authorization` header. The access token is passed as a
query parameter on the socket URL instead, and validated by a small ASGI middleware before Channels'
own `AuthMiddlewareStack` ever runs:

```text
wss://api.example.com/ws/notifications/?token=<access_token>
```

```python
# realtime/middleware.py — illustrative

class JWTAuthMiddleware:
    async def __call__(self, scope, receive, send):
        token = parse_qs(scope['query_string'].decode()).get('token', [None])[0]
        scope['user'] = await get_user_from_jwt(token) if token else AnonymousUser()
        return await self.app(scope, receive, send)
```

This reuses the existing `rest_framework_simplejwt` access token — no new auth mechanism, no second
login. A token that is expired, missing, or invalid results in `AnonymousUser`, and `connect()` closes
the socket with code `4001`, matching the pattern DRF already uses (401 on the HTTP side).

---

# 10. ASGI Routing

```python
# config/asgi.py — replaces the plain get_asgi_application() call

application = ProtocolTypeRouter({
    'http': django_asgi_app,                      # unchanged DRF/Django views
    'websocket': JWTAuthMiddleware(
        URLRouter(realtime.routing.websocket_urlpatterns)
    ),
})
```

```python
# realtime/routing.py

websocket_urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
]
```

A single endpoint (`/ws/notifications/`) carries both messaging and notification events — see §11 for
how the client tells them apart. This avoids a second connection (and a second auth handshake) purely
to separate two event types that both belong to "things that happened to me."

---

# 11. Event Catalog (payload shapes)

Every event sent down the socket has the same envelope:

```json
{
  "event": "message.new",
  "data": { }
}
```

## message.new

Sent to every participant of a conversation (including the sender, so every open tab — not just other
devices — re-renders consistently) when `POST /messages/` succeeds.

```json
{
  "event": "message.new",
  "data": {
    "conversation_id": 12,
    "message": {
      "id": 501,
      "sender": { "id": 7, "full_name": "Grace Mwangi" },
      "content": "Sounds good, see you then.",
      "created_at": "2026-09-22T10:04:00Z"
    }
  }
}
```

## conversation.updated

Sent alongside `message.new` so a conversation list page (not currently viewing the conversation) can
bump it to the top and show a preview without a full refetch.

```json
{
  "event": "conversation.updated",
  "data": {
    "conversation_id": 12,
    "last_message_preview": "Sounds good, see you then.",
    "updated_at": "2026-09-22T10:04:00Z"
  }
}
```

## notification.new

Sent to the recipient when a `Notification` row is created — from any of the three existing call
sites (see §12).

```json
{
  "event": "notification.new",
  "data": {
    "id": 88,
    "notification_type": "assignment_graded",
    "title": "Assignment graded",
    "message": "Your submission for \"Applied Project\" was graded: 82/100.",
    "reference_type": "assignment_submission",
    "reference_id": 501,
    "created_at": "2026-09-22T10:05:00Z"
  }
}
```

## notification.read

Sent back to the *same user's* other open tabs/devices when a notification is marked read from one of
them, so the badge count agrees everywhere without each tab re-polling.

```json
{
  "event": "notification.read",
  "data": { "id": 88 }
}
```

---

# 12. Backend Integration Points

Exactly three existing call sites create the data these events represent — confirmed by searching the
codebase for every place a `Notification` row is created, plus the one place a `Message` is created:

```text
messaging/views.py                    -> after Message.objects.create(...)
notifications/reminders.py            -> after Notification.objects.create(...)  (due-date/live-class/
                                          inactivity/payment reminders — see Authentication.md-style
                                          reminder spec already implemented this session)
accounts/management/commands/seed_data.py -> seed-only, does NOT publish (no sockets connected while
                                          seeding, and it would be noise against fake historical data)
```

Each real call site gains exactly one line after the existing `.create(...)` / `.save()`:

```python
from realtime.events import publish_to_user

# messaging/views.py, after saving the message:
for participant_id in conversation.participants.values_list('user_id', flat=True):
    publish_to_user(participant_id, 'message.new', {...})
    publish_to_user(participant_id, 'conversation.updated', {...})

# notifications/reminders.py, after Notification.objects.create(...):
publish_to_user(notification.user_id, 'notification.new', {...})
```

`publish_to_user` is the only function outside `realtime/` that ever touches the channel layer —
callers never import `channels` directly. If Redis is down, `publish_to_user` catches and logs the
error rather than raising: a failed push must never fail the HTTP request that triggered it (the
message/notification is already safely in Postgres by the time this line runs).

---

# 13. Frontend Integration

## 13.1 New module

```text
src/lib/socket.js
```

Responsibilities:

```text
- Open one WebSocket per logged-in session, to /ws/notifications/?token=<accessToken>
- Reconnect with exponential backoff (1s, 2s, 4s, 8s, capped at 30s) on unexpected close
- Re-open with a fresh token if the access token was refreshed since the socket was opened
- Expose a tiny pub/sub surface other modules subscribe to, same shape as the existing
  currency.js pattern (see src/lib/currency.js / src/hooks/useCurrency.js) so this stays
  consistent with how the app already does "backend value that needs to reach many components"
```

## 13.2 Consumers of the socket

```text
useUnreadMessages.js   - keeps its 30s poll as a fallback/floor, but also subscribes to
                          'message.new' / 'notification.new' and refreshes immediately on
                          either — the badge becomes instant instead of up-to-30s stale,
                          without removing the safety net if the socket is ever down.
NotificationPanel.jsx  - subscribes to 'notification.new' to prepend the new item live, and
                          to 'notification.read' to decrement its own badge if the user reads
                          it from another tab.
MessagesInbox.jsx      - subscribes to 'message.new' for the currently-open conversation
                          (append the message) and 'conversation.updated' for the list
                          (re-sort, update preview) — replaces the "stares at a static thread"
                          gap called out in §1.
```

## 13.3 Fallback behavior

Every one of the above already has a working polling/fetch-on-mount implementation today. None of
that code is deleted — the socket only makes it fire sooner. If the socket never connects (blocked by
a proxy, browser extension, etc.), the app behaves exactly as it does right now. This is the same
"progressive enhancement, don't remove the thing that already works" approach this session already
used for the `useUnreadMessages` polling itself.

---

# 14. Docker / Deployment Changes

```yaml
# docker-compose.yml — additions

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    # ...unchanged...
    environment:
      # ...existing vars...
      REDIS_URL: ${REDIS_URL:-redis://redis:6379/0}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
```

```dockerfile
# backend/Dockerfile — entrypoint.sh's final line changes from:
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 ...

# to:
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

`gunicorn` and `whitenoise` stay in `requirements.txt` — WhiteNoise's middleware works unchanged under
ASGI, and nothing else about static/media serving changes. Only the process that binds port 8000
changes, from a WSGI server to an ASGI one, because ASGI is a superset (it serves the existing plain
HTTP views exactly as before, in addition to WebSocket).

`nginx.conf` (frontend container) needs one addition if the frontend ever proxies `/ws/` through the
same origin instead of connecting to the backend's own port directly:

```nginx
location /ws/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

(Not required if the frontend connects straight to `VITE_API_URL`'s host — included here so the choice
is explicit rather than discovered at deploy time.)

---

# 15. Security Considerations

```text
Auth          - every connection is authenticated via the same JWT access token already used for
                REST calls (see §9); no new credential type introduced.
Origin        - CHANNELS_ALLOWED_ORIGINS mirrors the existing CORS_ALLOWED_ORIGINS setting
                (config/settings.py) so the same allow-list governs both HTTP and WebSocket.
Authorization - a user only ever joins their OWN group (user_{their_id} — see §7). There is no
                group name a client can request; group membership is derived server-side from the
                authenticated token, so one user cannot subscribe to another user's events.
Payload size  - Channels' default frame size limits apply; no user-supplied free text goes over the
                socket that isn't already validated by the existing MessageSerializer/
                NotificationSerializer on the HTTP side that created it.
Rate limiting - out of scope for v1 (read-only push channel with no client -> server messages beyond
                connect/disconnect — there is no user-controlled action to abuse yet).
```

---

# 16. Error Handling

```text
Connection refused / dropped  -> client silently retries with backoff (§13.1); existing polling/
                                  fetch-on-mount continues to work in the meantime.
Invalid/expired token on connect -> server closes with code 4001; client does not retry with the
                                  same token — it waits for AuthContext's normal token-refresh flow
                                  and reconnects with the new one.
Redis unavailable             -> publish_to_user() logs and swallows the error (§12); the HTTP
                                  request that triggered it still returns success normally.
Message delivered to a closed tab -> no special handling needed; the next poll/fetch-on-mount
                                  catches up, same as any missed HTTP request would.
```

---

# 17. Testing Requirements

## Backend

```text
Anonymous connection is rejected (close code 4001)
Authenticated connection is accepted and joins exactly one group: user_{id}
publish_to_user delivers to a connected consumer (ChannelsLiveServerTestCase / WebsocketCommunicator)
publish_to_user does not raise when the channel layer is unreachable
Sending a message publishes message.new to every participant, not just the sender
Creating a Notification publishes notification.new to that notification's user only
A user cannot receive events addressed to a different user's group
```

## Frontend

```text
socket.js reconnects with backoff after an unexpected close
socket.js re-opens with a refreshed token after AuthContext rotates it
useUnreadMessages still works with the socket entirely disabled (fallback path)
NotificationPanel prepends a live notification.new event without a refetch
MessagesInbox appends a live message.new event to the currently-open conversation only
```

---

# 18. Definition of Done

## Transport

* [x] `realtime` app created (consumers, routing, middleware, events helper)
* [x] `channels`, `channels-redis`, `daphne` added to `requirements.txt`
* [x] `config/asgi.py` serves both HTTP and WebSocket via `ProtocolTypeRouter`
* [x] JWT auth middleware validates the token on connect; rejects anonymous/invalid
* [x] `redis` service added to `docker-compose.yml`; backend `depends_on` it
* [x] Backend container entrypoint runs `daphne`, not `gunicorn`
* [x] `CHANNELS_ALLOWED_ORIGINS` mirrors `CORS_ALLOWED_ORIGINS`

## Messaging

* [x] `message.new` published to every conversation participant on send
* [x] `conversation.updated` published alongside it
* [x] `MessagesInbox.jsx` appends live messages to the open conversation
* [x] Conversation list re-orders/updates preview on `conversation.updated`
* [x] Existing fetch-on-mount/refresh behavior untouched as fallback

## Notifications

* [x] `notification.new` published on every existing `Notification.objects.create(...)` call site
* [x] `notification.read` published when a notification is marked read
* [x] `NotificationPanel.jsx` prepends live notifications
* [x] `useUnreadMessages.js` refreshes immediately on either event, keeps its 30s poll as a floor

## Quality

* [x] Backend consumer/middleware tests pass (§17) — 7 tests in `realtime/tests.py`
* [ ] Frontend socket reconnect/fallback tests pass (§17) — no frontend test runner exists yet in
      this project (no Vitest/Jest config); manual verification only (see below)
* [x] Manual check: two browser sessions as different users stay in sync — verified with two real
      Playwright browser contexts (Grace sends, Naledi receives instantly, zero console errors)
* [ ] Manual check: killing the `redis` container — not verified (Docker is unavailable in the
      development environment this was built in); the in-memory-channel-layer fallback in
      `config/settings.py` was exercised instead (no `REDIS_URL` set locally) and confirmed working
      end to end with a real daphne process and a real browser WebSocket client

---

# 19. Implementation Priority

```text
1. realtime app skeleton (consumer, routing, JWT middleware) — no callers yet
2. Docker/ASGI switch (daphne, redis service) — verify plain HTTP still works end to end first
3. publish_to_user() + wire the 3 backend call sites (§12)
4. src/lib/socket.js (connect, auth, reconnect/backoff)
5. useUnreadMessages.js subscription (smallest, highest-value integration — badge goes instant)
6. NotificationPanel.jsx subscription
7. MessagesInbox.jsx subscription (largest surface — open-conversation live append + list re-order)
8. Load/manual test with the existing seeded users (accounts.management.commands.seed_data),
   including the multi-tab "same user, two sessions" scenario from §18
```

Steps 1-3 can be verified entirely from the backend (a WebSocket test client, no UI changes yet).
Steps 4-7 are additive frontend subscriptions — each one can ship and be verified independently
without the others, and the app is fully functional (via existing polling/fetch) at every step in
between.
