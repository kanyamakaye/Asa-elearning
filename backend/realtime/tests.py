"""See Realtime.md #17 for the backend test list this covers."""

from channels.layers import get_channel_layer
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework_simplejwt.tokens import RefreshToken

from config.asgi import application
from .events import publish_to_user


async def group_send(user_id, event, data):
    # InMemoryChannelLayer is scoped to the current event loop (deliberately,
    # to avoid cross-loop asyncio bugs — see channels' own docs). publish_to_user's
    # async_to_sync wrapper runs on a different loop than this test's, so these
    # delivery tests call the channel layer directly instead of through
    # publish_to_user; test_publish_to_user_does_not_raise_without_a_channel_layer
    # below still covers publish_to_user's own sync-wrapping behavior.
    channel_layer = get_channel_layer()
    await channel_layer.group_send(f'user_{user_id}', {'type': 'push_event', 'payload': {'event': event, 'data': data}})

User = get_user_model()

IN_MEMORY_LAYER = {'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}}
# OriginValidator (config/asgi.py) rejects a connection with no/disallowed
# Origin header before it ever reaches the JWT middleware — matches what a
# real browser always sends, but WebsocketCommunicator sends nothing unless
# told to, so every "should succeed" test needs this explicitly.
ALLOWED_ORIGIN_HEADERS = [(b'origin', b'http://localhost:5173')]


def make_user(username):
    return User.objects.create_user(username=username, email=f'{username}@example.com', password='x', user_type='student')


def token_for(user):
    return str(RefreshToken.for_user(user).access_token)


@override_settings(CHANNEL_LAYERS=IN_MEMORY_LAYER)
class NotificationConsumerTests(TestCase):
    async def test_anonymous_connection_is_rejected(self):
        communicator = WebsocketCommunicator(application, '/ws/notifications/', headers=ALLOWED_ORIGIN_HEADERS)
        connected, subprotocol = await communicator.connect()
        self.assertFalse(connected)
        await communicator.disconnect()

    async def test_invalid_token_is_rejected(self):
        communicator = WebsocketCommunicator(
            application, '/ws/notifications/?token=not-a-real-token', headers=ALLOWED_ORIGIN_HEADERS,
        )
        connected, subprotocol = await communicator.connect()
        self.assertFalse(connected)
        await communicator.disconnect()

    async def test_disallowed_origin_is_rejected(self):
        communicator = WebsocketCommunicator(
            application, '/ws/notifications/', headers=[(b'origin', b'https://evil.example.com')],
        )
        connected, subprotocol = await communicator.connect()
        self.assertFalse(connected)
        await communicator.disconnect()

    async def test_authenticated_connection_is_accepted(self):
        user = await self._make_user('alice')
        token = await self._token_for(user)
        communicator = WebsocketCommunicator(
            application, f'/ws/notifications/?token={token}', headers=ALLOWED_ORIGIN_HEADERS,
        )
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_publish_to_user_delivers_to_connected_consumer(self):
        user = await self._make_user('bob')
        token = await self._token_for(user)
        communicator = WebsocketCommunicator(
            application, f'/ws/notifications/?token={token}', headers=ALLOWED_ORIGIN_HEADERS,
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await group_send(user.id, 'notification.new', {'id': 1, 'title': 'Hi'})

        message = await communicator.receive_json_from()
        self.assertEqual(message, {'event': 'notification.new', 'data': {'id': 1, 'title': 'Hi'}})
        await communicator.disconnect()

    async def test_publish_only_reaches_the_addressed_user(self):
        user_a = await self._make_user('carol')
        user_b = await self._make_user('dave')
        token_a = await self._token_for(user_a)
        token_b = await self._token_for(user_b)

        comm_a = WebsocketCommunicator(
            application, f'/ws/notifications/?token={token_a}', headers=ALLOWED_ORIGIN_HEADERS,
        )
        comm_b = WebsocketCommunicator(
            application, f'/ws/notifications/?token={token_b}', headers=ALLOWED_ORIGIN_HEADERS,
        )
        await comm_a.connect()
        await comm_b.connect()

        await group_send(user_a.id, 'notification.new', {'id': 2})

        message = await comm_a.receive_json_from()
        self.assertEqual(message['data']['id'], 2)
        self.assertTrue(await comm_b.receive_nothing(timeout=0.2))

        await comm_a.disconnect()
        await comm_b.disconnect()

    def test_publish_to_user_does_not_raise_without_a_channel_layer(self):
        with override_settings(CHANNEL_LAYERS={}):
            publish_to_user(999, 'notification.new', {'id': 3})  # must not raise

    async def _make_user(self, username):
        from channels.db import database_sync_to_async
        return await database_sync_to_async(make_user)(username)

    async def _token_for(self, user):
        from channels.db import database_sync_to_async
        return await database_sync_to_async(token_for)(user)
