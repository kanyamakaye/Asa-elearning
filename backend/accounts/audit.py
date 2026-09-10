"""Security-event audit trail — see Authentication.md §30. A thin wrapper
around AuditLog.objects.create so every call site logs the same shape and
so the "never log secrets" rule lives in exactly one place: callers pass
metadata dicts that must never contain a password, OTP, or token."""

from .models import AuditLog


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')


def log_event(event_type, *, user=None, request=None, result='success', **metadata):
    AuditLog.objects.create(
        user=user,
        event_type=event_type,
        result=result,
        ip_address=client_ip(request) if request else None,
        user_agent=(request.META.get('HTTP_USER_AGENT', '')[:255] if request else ''),
        metadata=metadata,
    )
