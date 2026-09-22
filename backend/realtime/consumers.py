"""One WebSocket connection per logged-in user, carrying both messaging and
notification events — see Realtime.md #7/#8 for why one connection/one group
per user rather than one per conversation."""

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return
        self.group_name = f'user_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Read-only push channel for v1 — no client -> server messages are
    # expected (see Realtime.md #8). Anything received is ignored rather
    # than erroring, so an errant client message can't kill the connection.
    async def receive_json(self, content, **kwargs):
        return

    async def push_event(self, event):
        # event == {'type': 'push_event', 'payload': {...}} — 'type' is
        # Channels' own group_send routing key (maps to this method name);
        # the real event name lives inside payload['event'] (see
        # realtime.events.publish_to_user and Realtime.md #11).
        await self.send_json(event['payload'])
