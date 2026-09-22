"""Authenticates a WebSocket handshake using the same JWT access token the
REST API already accepts — see Realtime.md #9. Browsers cannot send an
Authorization header on a WebSocket upgrade, so the token travels as a query
parameter instead: wss://.../ws/notifications/?token=<access_token>

A missing, malformed, or expired token results in scope['user'] being
AnonymousUser, exactly like DRF leaves request.user on an unauthenticated
request — the consumer is responsible for closing the connection, not this
middleware (see realtime.consumers.NotificationConsumer.connect)."""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


@database_sync_to_async
def user_from_token(raw_token):
    if not raw_token:
        return AnonymousUser()
    try:
        auth = JWTAuthentication()
        validated = auth.get_validated_token(raw_token.encode('utf-8'))
        return auth.get_user(validated)
    except (InvalidToken, TokenError):
        return AnonymousUser()


class JWTAuthMiddleware:
    """ASGI middleware — wraps Channels' URLRouter, not a Django MIDDLEWARE
    entry (different protocol, see config/asgi.py)."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope.get('query_string', b'').decode('utf-8'))
        raw_token = query_string.get('token', [None])[0]
        scope['user'] = await user_from_token(raw_token)
        return await self.app(scope, receive, send)
