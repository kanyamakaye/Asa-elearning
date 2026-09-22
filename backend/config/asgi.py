"""
ASGI config for config project.

Serves both plain HTTP (the existing Django/DRF views, unchanged) and
WebSocket connections (see Realtime.md) from one process/one port — see
Realtime.md #4 for why this was chosen over a separate real-time service.
"""

import os

import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import OriginValidator
from django.conf import settings
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Must run before importing anything that touches Django models (routing,
# consumers, the JWT middleware) — django.setup() populates the app registry.
django_asgi_app = get_asgi_application()
django.setup()

from realtime.middleware import JWTAuthMiddleware  # noqa: E402
from realtime.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': OriginValidator(
        # No AuthMiddlewareStack/session auth — this app is JWT-only end to
        # end (see Realtime.md #9), so the token is the sole source of
        # scope['user'] for a socket, same as DRF's own request.user.
        JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
        settings.CHANNELS_ALLOWED_ORIGINS,
    ),
})
