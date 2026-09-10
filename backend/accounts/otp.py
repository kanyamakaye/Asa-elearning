"""Centralized one-time-code service shared by every OTP purpose
(registration, login 2FA, password reset, instructor activation) — see
Authentication.md §7-13. Deliberately the *only* place that generates,
hashes, or checks an OTP so every call site gets the same security
properties (secure randomness, hashed storage, expiry, single use, capped
attempts) instead of ad-hoc per-feature logic.
"""

import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from .models import OTP

OTP_LENGTH = getattr(settings, 'OTP_LENGTH', 6)
OTP_EXPIRATION_MINUTES = getattr(settings, 'OTP_EXPIRATION_MINUTES', 10)
OTP_MAX_ATTEMPTS = getattr(settings, 'OTP_MAX_ATTEMPTS', 5)
OTP_RESEND_COOLDOWN_SECONDS = getattr(settings, 'OTP_RESEND_COOLDOWN_SECONDS', 60)


def generate_code():
    """Cryptographically secure, zero-padded numeric code."""
    return ''.join(secrets.choice('0123456789') for _ in range(OTP_LENGTH))


def hash_otp(code):
    # Reuses Django's own password hasher (Argon2id/PBKDF2 per PASSWORD_HASHERS)
    # instead of inventing a separate hashing scheme for a second secret type.
    return make_password(code)


def seconds_until_resend_allowed(user, purpose):
    """0 if a new OTP may be requested now, otherwise how many seconds the
    caller must still wait — used by the resend endpoint and the frontend
    countdown alike."""
    last = OTP.objects.filter(user=user, purpose=purpose).order_by('-created_at').first()
    if not last:
        return 0
    elapsed = (timezone.now() - last.created_at).total_seconds()
    remaining = OTP_RESEND_COOLDOWN_SECONDS - elapsed
    return max(0, round(remaining))


def issue_otp(user, purpose):
    """Invalidates any still-usable OTP of this purpose for the user, creates
    a new one, and returns (otp_row, plaintext_code). The plaintext code is
    only ever returned here, to be handed straight to an email-sending
    function — never logged, never stored, never returned via any API
    response."""
    OTP.objects.filter(user=user, purpose=purpose, used=False).update(used=True, used_at=timezone.now())

    code = generate_code()
    otp = OTP.objects.create(
        user=user,
        purpose=purpose,
        otp_hash=hash_otp(code),
        expires_at=timezone.now() + timedelta(minutes=OTP_EXPIRATION_MINUTES),
    )
    return otp, code


class OTPVerificationError(Exception):
    """Raised with a safe, user-facing message — never leaks which specific
    condition (missing/expired/wrong/exhausted) failed, to avoid handing an
    attacker a signal about which part of their guess was closer."""


GENERIC_INVALID_MESSAGE = 'The verification code is invalid or has expired. Please try again or request a new code.'


def verify_otp(user, purpose, submitted_code):
    """Validates a submitted code against the latest unused OTP of the given
    purpose for the user. Raises OTPVerificationError on any failure;
    returns nothing (just doesn't raise) on success, after marking the OTP
    used so it can never be replayed."""
    otp = OTP.objects.filter(user=user, purpose=purpose, used=False).order_by('-created_at').first()
    if not otp:
        raise OTPVerificationError(GENERIC_INVALID_MESSAGE)

    if otp.expires_at < timezone.now():
        raise OTPVerificationError(GENERIC_INVALID_MESSAGE)

    if otp.attempt_count >= OTP_MAX_ATTEMPTS:
        otp.used = True
        otp.used_at = timezone.now()
        otp.save(update_fields=['used', 'used_at'])
        raise OTPVerificationError('Too many verification attempts. Please request a new code.')

    if not check_password(submitted_code, otp.otp_hash):
        otp.attempt_count += 1
        otp.save(update_fields=['attempt_count'])
        raise OTPVerificationError(GENERIC_INVALID_MESSAGE)

    otp.used = True
    otp.used_at = timezone.now()
    otp.save(update_fields=['used', 'used_at'])
