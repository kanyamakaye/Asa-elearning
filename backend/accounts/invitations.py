"""Instructor invitation tokens — Authentication.md §17. Unlike an OTP
(short, low-entropy, looked up by user+purpose and checked with a slow
hasher), an invitation token is a single high-entropy secret carried in a
URL and must be looked up *by value*, so it's hashed with a fast,
deterministic digest (SHA-256) rather than Django's salted password
hasher — standard practice for bearer tokens/API keys of this kind.
"""

import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import InstructorInvitation


def _hash_token(raw_token):
    return hashlib.sha256(raw_token.encode()).hexdigest()


def generate_invitation(user, created_by):
    raw_token = secrets.token_urlsafe(32)
    invitation = InstructorInvitation.objects.create(
        user=user,
        token_hash=_hash_token(raw_token),
        expires_at=timezone.now() + timedelta(hours=settings.INSTRUCTOR_INVITATION_EXPIRATION_HOURS),
        created_by=created_by,
    )
    return invitation, raw_token


def resolve_invitation(raw_token):
    """Returns the matching, not-yet-used InstructorInvitation, or None —
    callers still need to check `.expires_at` themselves so they can return
    a distinct "expired" vs "invalid" message."""
    return InstructorInvitation.objects.select_related('user').filter(
        token_hash=_hash_token(raw_token), used=False,
    ).first()


def build_activation_url(raw_token):
    return f'{settings.FRONTEND_URL.rstrip("/")}/instructor/activate?token={raw_token}'
