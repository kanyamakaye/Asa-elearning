"""Asa Academy's branded transactional emails (Authentication.md §21-27) —
every authentication event renders the same base template
(templates/emails/base.html) with different content, instead of building
HTML inline in views. Sent via Django's configured EMAIL_BACKEND, so no new
dependency is needed and the console backend "just works" in development.
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .otp import OTP_EXPIRATION_MINUTES

PLATFORM_NAME = 'Asa Academy'


def _send(to_email, subject, **context):
    html = render_to_string('emails/base.html', {'subject': subject, **context})
    text = strip_tags(html)
    message = EmailMultiAlternatives(
        subject=f'{subject}',
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    message.attach_alternative(html, 'text/html')
    # fail_silently would swallow real misconfiguration in production; the
    # console backend used in dev never raises anyway.
    message.send(fail_silently=False)


def send_registration_otp_email(user, otp):
    _send(
        user.email,
        f'Welcome to {PLATFORM_NAME} — Verify Your Email',
        heading=f'Welcome to {PLATFORM_NAME}!',
        intro_lines=[
            f'Hello {user.first_name},',
            'Thank you for creating your account. To complete your registration and start your '
            f'learning journey, please verify your email address using the verification code below:',
        ],
        otp=otp,
        expiration_minutes=OTP_EXPIRATION_MINUTES,
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_login_2fa_email(user, otp):
    _send(
        user.email,
        f'{PLATFORM_NAME} — Your Login Verification Code',
        heading='Two-Factor Authentication',
        intro_lines=[
            f'Hello {user.first_name},',
            f'A login attempt was made on your {PLATFORM_NAME} account. To continue signing in, '
            'enter the verification code below:',
        ],
        otp=otp,
        expiration_minutes=OTP_EXPIRATION_MINUTES,
        security_note=(
            f'If you did not attempt to sign in to {PLATFORM_NAME}, please secure your account by '
            'changing your password and contacting support immediately.'
        ),
        signoff_team=f'{PLATFORM_NAME} Security Team',
    )


def send_instructor_invitation_email(user, activation_url):
    _send(
        user.email,
        f'Welcome to {PLATFORM_NAME} — Instructor Account Invitation',
        heading=f'Welcome to {PLATFORM_NAME}!',
        intro_lines=[
            f'Hello {user.first_name},',
            f'An administrator has created an Instructor account for you on the {PLATFORM_NAME} e-learning platform.',
            'To activate your Instructor account, please complete the account verification process '
            'using the button below. During activation you’ll confirm your email address, create '
            'your password, and complete two-factor authentication.',
            'For your security, this invitation is temporary and can only be used once.',
        ],
        cta_url=activation_url,
        cta_label='Activate My Asa Academy Instructor Account',
        security_note=(
            'If you were not expecting this invitation, please contact the Asa Academy administration team.'
        ),
        signoff_team=f'{PLATFORM_NAME} Administration Team',
    )


def send_instructor_verification_email(user, otp):
    _send(
        user.email,
        f'{PLATFORM_NAME} — Verify Your Instructor Account',
        heading='Verify Your Instructor Account',
        intro_lines=[
            f'Hello {user.first_name},',
            f'You are almost ready to start using your Instructor account on {PLATFORM_NAME}. Please '
            'use the verification code below to confirm your email address:',
        ],
        otp=otp,
        expiration_minutes=OTP_EXPIRATION_MINUTES,
        security_note=(
            f'If you did not expect an Instructor account invitation from {PLATFORM_NAME}, please '
            'contact the administration team.'
        ),
        signoff_team=f'{PLATFORM_NAME} Security Team',
    )


def send_instructor_2fa_email(user, otp):
    _send(
        user.email,
        f'{PLATFORM_NAME} — Instructor Login Verification Code',
        heading='Instructor Sign-In Verification',
        intro_lines=[
            f'Hello {user.first_name},',
            f'A sign-in attempt was made on your {PLATFORM_NAME} Instructor account. To continue '
            'signing in, please enter the verification code below:',
        ],
        otp=otp,
        expiration_minutes=OTP_EXPIRATION_MINUTES,
        security_note=(
            'If you did not attempt to sign in, please change your password immediately and contact '
            f'the {PLATFORM_NAME} administration team.'
        ),
        signoff_team=f'{PLATFORM_NAME} Security Team',
    )


def send_password_reset_email(user, otp):
    _send(
        user.email,
        f'{PLATFORM_NAME} — Password Reset Request',
        heading='Reset Your Password',
        intro_lines=[
            f'Hello {user.first_name},',
            f'We received a request to reset the password for your {PLATFORM_NAME} account. Use the '
            'verification code below to continue:',
        ],
        otp=otp,
        expiration_minutes=OTP_EXPIRATION_MINUTES,
        security_note=(
            'If you did not request a password reset, please ignore this email — your existing '
            'password will remain unchanged. Never share this code with anyone.'
        ),
        signoff_team=f'{PLATFORM_NAME} Security Team',
    )


def send_password_changed_email(user):
    _send(
        user.email,
        f'{PLATFORM_NAME} — Your Password Has Been Changed',
        heading='Your Password Was Changed',
        intro_lines=[
            f'Hello {user.first_name},',
            f'Your {PLATFORM_NAME} account password was successfully changed. If you made this '
            'change, no further action is required.',
        ],
        security_note=(
            'If you did not make this change, please contact Asa Academy support immediately and '
            'secure your account.'
        ),
        signoff_team=f'{PLATFORM_NAME} Security Team',
    )


def send_account_activated_email(user):
    _send(
        user.email,
        f'Welcome to {PLATFORM_NAME} — Your Account Is Ready',
        heading='Your Account Is Ready',
        intro_lines=[
            f'Hello {user.first_name},',
            f'Your {PLATFORM_NAME} account has been successfully verified. Your account is now '
            'active and you can sign in to access your dashboard and begin exploring available courses.',
            f'Welcome to {PLATFORM_NAME}! We wish you a successful learning experience.',
        ],
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_security_alert_email(user, activity, ip_address=None, device=None):
    details = [f'Activity: {activity}']
    if ip_address:
        details.append(f'IP address: {ip_address}')
    if device:
        details.append(f'Device: {device}')
    _send(
        user.email,
        f'{PLATFORM_NAME} — Security Alert',
        heading='Security Alert',
        intro_lines=[
            f'Hello {user.first_name},',
            f'We detected a security-related activity on your {PLATFORM_NAME} account.',
            ' · '.join(details),
            'If this was you, no action is required.',
        ],
        security_note=(
            'If you do not recognize this activity, please change your password and contact Asa '
            'Academy support immediately.'
        ),
        signoff_team=f'{PLATFORM_NAME} Security Team',
    )
