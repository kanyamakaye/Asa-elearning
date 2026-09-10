from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .invitations import build_activation_url, generate_invitation
from .models import LoginChallenge, OTP
from .otp import issue_otp

User = get_user_model()

VALID_PASSWORD = 'AsaAcademy@2026'


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class RegistrationTests(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in cache, not the DB — reset between tests
        self.client = APIClient()
        self.url = reverse('auth-register')
        self.payload = {
            'username': 'newlearner', 'email': 'learner@example.com',
            'password': VALID_PASSWORD, 'password_confirm': VALID_PASSWORD,
            'first_name': 'New', 'last_name': 'Learner',
            'accept_terms': True, 'accept_privacy_policy': True,
        }

    def test_valid_registration_creates_pending_learner_and_sends_otp(self):
        res = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(email='learner@example.com')
        self.assertEqual(user.user_type, User.UserType.STUDENT)
        self.assertEqual(user.status, User.Status.PENDING_VERIFICATION)
        self.assertFalse(user.email_verified)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verify Your Email', mail.outbox[0].subject)

    def test_role_cannot_be_escalated_via_registration(self):
        res = self.client.post(self.url, {**self.payload, 'user_type': 'instructor', 'role': 'admin'}, format='json')
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(email='learner@example.com')
        self.assertEqual(user.user_type, User.UserType.STUDENT)

    def test_missing_required_field_rejected(self):
        payload = {**self.payload}
        del payload['first_name']
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, 400)

    def test_password_mismatch_rejected(self):
        res = self.client.post(self.url, {**self.payload, 'password_confirm': 'Different1!'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_weak_password_rejected(self):
        res = self.client.post(self.url, {**self.payload, 'password': 'password', 'password_confirm': 'password'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_terms_not_accepted_rejected(self):
        res = self.client.post(self.url, {**self.payload, 'accept_terms': False}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_duplicate_email_rejected(self):
        self.client.post(self.url, self.payload, format='json')
        res = self.client.post(self.url, {**self.payload, 'username': 'anotherone'}, format='json')
        self.assertEqual(res.status_code, 400)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': ('accounts.authentication.StatusCheckingJWTAuthentication',),
        'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticatedOrReadOnly',),
        'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardPagination',
        'PAGE_SIZE': 20,
        'DEFAULT_THROTTLE_CLASSES': (),
        'DEFAULT_THROTTLE_RATES': {},
    },
)
class EmailVerificationTests(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in cache, not the DB — reset between tests
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='pendinguser', email='pending@example.com', password=VALID_PASSWORD,
            first_name='Pending', last_name='User', status=User.Status.PENDING_VERIFICATION,
        )
        self.otp, self.code = issue_otp(self.user, OTP.Purpose.REGISTRATION)
        self.url = reverse('auth-verify-email')

    def test_correct_otp_activates_account(self):
        res = self.client.post(self.url, {'email': self.user.email, 'otp': self.code}, format='json')
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)
        self.assertEqual(self.user.status, User.Status.ACTIVE)

    def test_incorrect_otp_rejected_and_counts_attempt(self):
        res = self.client.post(self.url, {'email': self.user.email, 'otp': '000000'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.otp.refresh_from_db()
        self.assertEqual(self.otp.attempt_count, 1)

    def test_expired_otp_rejected(self):
        self.otp.expires_at = timezone.now() - timedelta(minutes=1)
        self.otp.save(update_fields=['expires_at'])
        res = self.client.post(self.url, {'email': self.user.email, 'otp': self.code}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_otp_cannot_be_reused(self):
        self.client.post(self.url, {'email': self.user.email, 'otp': self.code}, format='json')
        res = self.client.post(self.url, {'email': self.user.email, 'otp': self.code}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_max_attempts_locks_out_otp(self):
        for _ in range(5):
            self.client.post(self.url, {'email': self.user.email, 'otp': '000000'}, format='json')
        res = self.client.post(self.url, {'email': self.user.email, 'otp': self.code}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_resend_otp_invalidates_previous(self):
        # Past the resend cooldown, so this exercises "resend allowed" rather
        # than the cooldown rejection covered by test_resend_respects_cooldown.
        OTP.objects.filter(pk=self.otp.pk).update(created_at=timezone.now() - timedelta(minutes=2))
        res = self.client.post(reverse('auth-resend-otp'), {'email': self.user.email, 'purpose': 'registration'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.otp.refresh_from_db()
        self.assertTrue(self.otp.used)
        res = self.client.post(self.url, {'email': self.user.email, 'otp': self.code}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_resend_respects_cooldown(self):
        from rest_framework.status import HTTP_429_TOO_MANY_REQUESTS
        res = self.client.post(reverse('auth-resend-otp'), {'email': self.user.email, 'purpose': 'registration'}, format='json')
        self.assertEqual(res.status_code, HTTP_429_TOO_MANY_REQUESTS)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': ('accounts.authentication.StatusCheckingJWTAuthentication',),
        'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticatedOrReadOnly',),
        'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardPagination',
        'PAGE_SIZE': 20,
        'DEFAULT_THROTTLE_CLASSES': (),
        'DEFAULT_THROTTLE_RATES': {},
    },
)
class LoginAndTwoFactorTests(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in cache, not the DB — reset between tests
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='activeuser', email='active@example.com', password=VALID_PASSWORD,
            first_name='Active', last_name='User', status=User.Status.ACTIVE, email_verified=True,
        )
        self.login_url = reverse('auth-login')
        self.verify_url = reverse('auth-verify-2fa')

    def test_valid_credentials_issue_challenge_not_tokens(self):
        res = self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['requires_two_factor'])
        self.assertNotIn('access', res.data)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verification Code', mail.outbox[0].subject)

    def test_invalid_password_rejected(self):
        res = self.client.post(self.login_url, {'email': self.user.email, 'password': 'wrong'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_unverified_account_cannot_login(self):
        self.user.status = User.Status.PENDING_VERIFICATION
        self.user.save(update_fields=['status'])
        res = self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_suspended_account_cannot_login(self):
        self.user.status = User.Status.SUSPENDED
        self.user.save(update_fields=['status'])
        res = self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_correct_2fa_otp_grants_tokens(self):
        self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        challenge = LoginChallenge.objects.get(user=self.user)
        raw_code = self._extract_code(challenge)
        res = self.client.post(self.verify_url, {'challenge_id': str(challenge.id), 'otp': raw_code}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_incorrect_2fa_otp_rejected(self):
        self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        challenge = LoginChallenge.objects.get(user=self.user)
        res = self.client.post(self.verify_url, {'challenge_id': str(challenge.id), 'otp': '000000'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertNotIn('access', res.data)

    def test_expired_2fa_challenge_rejected(self):
        self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        challenge = LoginChallenge.objects.get(user=self.user)
        challenge.expires_at = timezone.now() - timedelta(minutes=1)
        challenge.save(update_fields=['expires_at'])
        raw_code = self._extract_code(challenge)
        res = self.client.post(self.verify_url, {'challenge_id': str(challenge.id), 'otp': raw_code}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_2fa_otp_cannot_be_reused(self):
        self.client.post(self.login_url, {'email': self.user.email, 'password': VALID_PASSWORD}, format='json')
        challenge = LoginChallenge.objects.get(user=self.user)
        raw_code = self._extract_code(challenge)
        self.client.post(self.verify_url, {'challenge_id': str(challenge.id), 'otp': raw_code}, format='json')
        res = self.client.post(self.verify_url, {'challenge_id': str(challenge.id), 'otp': raw_code}, format='json')
        self.assertEqual(res.status_code, 400)

    def _extract_code(self, challenge):
        # Tests can't recover a hashed OTP's plaintext, so re-issue and read
        # straight from the service layer instead of parsing the email body.
        from .otp import issue_otp as _issue
        otp_row, code = _issue(self.user, OTP.Purpose.LOGIN_2FA)
        challenge.otp = otp_row
        challenge.save(update_fields=['otp'])
        return code


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': ('accounts.authentication.StatusCheckingJWTAuthentication',),
        'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticatedOrReadOnly',),
        'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardPagination',
        'PAGE_SIZE': 20,
        'DEFAULT_THROTTLE_CLASSES': (),
        'DEFAULT_THROTTLE_RATES': {},
    },
)
class InstructorProvisioningTests(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in cache, not the DB — reset between tests
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin1', email='admin1@example.com', password=VALID_PASSWORD,
            user_type=User.UserType.ADMIN, status=User.Status.ACTIVE, email_verified=True,
        )
        self.student = User.objects.create_user(
            username='student1', email='student1@example.com', password=VALID_PASSWORD,
            user_type=User.UserType.STUDENT, status=User.Status.ACTIVE, email_verified=True,
        )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_admin_creates_instructor_with_forced_role_and_status(self):
        self._auth(self.admin)
        res = self.client.post('/api/v1/users/create-instructor/', {
            'username': 'newinstructor', 'email': 'instructor@example.com',
            'first_name': 'New', 'last_name': 'Instructor',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(email='instructor@example.com')
        self.assertEqual(user.user_type, User.UserType.INSTRUCTOR)
        self.assertEqual(user.status, User.Status.PENDING_ACTIVATION)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Instructor Account Invitation', mail.outbox[0].subject)

    def test_non_admin_cannot_create_instructor(self):
        self._auth(self.student)
        res = self.client.post('/api/v1/users/create-instructor/', {
            'username': 'newinstructor2', 'email': 'instructor2@example.com',
            'first_name': 'New', 'last_name': 'Instructor',
        }, format='json')
        self.assertIn(res.status_code, (403, 401))
        self.assertFalse(User.objects.filter(email='instructor2@example.com').exists())

    def test_role_forced_even_if_role_supplied(self):
        self._auth(self.admin)
        res = self.client.post('/api/v1/users/create-instructor/', {
            'username': 'sneaky', 'email': 'sneaky@example.com',
            'first_name': 'Sneaky', 'last_name': 'One', 'user_type': 'admin', 'role': 'admin',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(email='sneaky@example.com')
        self.assertEqual(user.user_type, User.UserType.INSTRUCTOR)

    def test_full_instructor_activation_flow(self):
        instructor = User.objects.create_user(
            username='pendinginstructor', email='pending-instructor@example.com',
            first_name='Pending', last_name='Instructor',
            user_type=User.UserType.INSTRUCTOR, status=User.Status.PENDING_ACTIVATION,
        )
        instructor.set_unusable_password()
        instructor.save()
        invitation, raw_token = generate_invitation(instructor, created_by=self.admin)

        activate_res = self.client.post(reverse('auth-instructor-activate'), {
            'token': raw_token, 'password': VALID_PASSWORD, 'confirm_password': VALID_PASSWORD,
        }, format='json')
        self.assertEqual(activate_res.status_code, 200)
        instructor.refresh_from_db()
        self.assertTrue(instructor.has_usable_password())
        self.assertEqual(instructor.status, User.Status.PENDING_ACTIVATION)  # still pending until email verified

        from .otp import issue_otp as _issue
        otp_row, code = _issue(instructor, OTP.Purpose.INSTRUCTOR_ACTIVATION)

        verify_res = self.client.post(reverse('auth-instructor-verify-email'), {
            'email': instructor.email, 'otp': code,
        }, format='json')
        self.assertEqual(verify_res.status_code, 200)
        instructor.refresh_from_db()
        self.assertTrue(instructor.email_verified)
        self.assertEqual(instructor.status, User.Status.ACTIVE)

    def test_pending_instructor_cannot_login(self):
        instructor = User.objects.create_user(
            username='stillpending', email='still-pending@example.com',
            user_type=User.UserType.INSTRUCTOR, status=User.Status.PENDING_ACTIVATION,
        )
        instructor.set_password(VALID_PASSWORD)
        instructor.save()
        res = self.client.post(reverse('auth-login'), {'email': instructor.email, 'password': VALID_PASSWORD}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_expired_invitation_rejected(self):
        instructor = User.objects.create_user(
            username='expiredinvite', email='expired-invite@example.com',
            user_type=User.UserType.INSTRUCTOR, status=User.Status.PENDING_ACTIVATION,
        )
        instructor.set_unusable_password()
        instructor.save()
        invitation, raw_token = generate_invitation(instructor, created_by=self.admin)
        invitation.expires_at = timezone.now() - timedelta(hours=1)
        invitation.save(update_fields=['expires_at'])

        res = self.client.post(reverse('auth-instructor-activate'), {
            'token': raw_token, 'password': VALID_PASSWORD, 'confirm_password': VALID_PASSWORD,
        }, format='json')
        self.assertEqual(res.status_code, 400)

    def test_invitation_token_single_use(self):
        instructor = User.objects.create_user(
            username='onetimeuse', email='one-time-use@example.com',
            user_type=User.UserType.INSTRUCTOR, status=User.Status.PENDING_ACTIVATION,
        )
        instructor.set_unusable_password()
        instructor.save()
        invitation, raw_token = generate_invitation(instructor, created_by=self.admin)

        self.client.post(reverse('auth-instructor-activate'), {
            'token': raw_token, 'password': VALID_PASSWORD, 'confirm_password': VALID_PASSWORD,
        }, format='json')
        res = self.client.post(reverse('auth-instructor-activate'), {
            'token': raw_token, 'password': 'AnotherPass@1', 'confirm_password': 'AnotherPass@1',
        }, format='json')
        self.assertEqual(res.status_code, 400)


class SecurityInvariantTests(TestCase):
    def test_password_hash_never_serialized(self):
        from .serializers import UserSerializer
        user = User.objects.create_user(username='x', email='x@example.com', password=VALID_PASSWORD)
        data = UserSerializer(user).data
        self.assertNotIn('password', data)

    def test_otp_never_stored_in_plaintext(self):
        user = User.objects.create_user(username='y', email='y@example.com', password=VALID_PASSWORD)
        otp, code = issue_otp(user, OTP.Purpose.REGISTRATION)
        self.assertNotEqual(otp.otp_hash, code)
        self.assertNotIn(code, otp.otp_hash)

    def test_invitation_token_never_stored_in_plaintext(self):
        admin = User.objects.create_user(username='admin2', email='admin2@example.com', password=VALID_PASSWORD)
        instructor = User.objects.create_user(username='inst2', email='inst2@example.com', password=VALID_PASSWORD)
        invitation, raw_token = generate_invitation(instructor, created_by=admin)
        self.assertNotEqual(invitation.token_hash, raw_token)
        self.assertNotIn(raw_token, invitation.token_hash)
