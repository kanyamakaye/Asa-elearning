"""The only place outside this app that touches the channel layer — every
other app calls publish_to_user() and never imports `channels` directly (see
Realtime.md #12). Called from plain synchronous Django/DRF code, hence
async_to_sync: Channels' channel layer API is async-only."""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def publish_to_user(user_id, event, data):
    """Push {event, data} to every open socket for user_id's own group
    (see Realtime.md #7 — one group per user, named user_{id}).

    Never raises: a push is a best-effort enhancement over data that is
    already safely persisted by the caller (a Message or Notification row)
    before this runs, so a down/unreachable channel layer must not turn
    into a failed HTTP request. See Realtime.md #16."""
    if not user_id:
        return
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    try:
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {'type': 'push_event', 'payload': {'event': event, 'data': data}},
        )
    except Exception:
        logger.warning('realtime: failed to publish %s to user %s', event, user_id, exc_info=True)
