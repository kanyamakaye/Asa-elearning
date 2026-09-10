from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class StatusCheckingJWTAuthentication(JWTAuthentication):
    """Authentication.md §29 — re-checks account status on every request,
    not just at login. A still-unexpired JWT issued before an account was
    suspended/locked/blocked must not keep granting access."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user.status != user.Status.ACTIVE:
            raise AuthenticationFailed('This account is not currently active.', code='account_inactive')
        return user
