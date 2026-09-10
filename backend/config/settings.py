"""
Django settings for config project.
"""

from datetime import timedelta
from pathlib import Path

import os

from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'django-insecure-x9dif-)t6z48((olrpprnmhs+#_*927p25p_e!5ua-mqdd5-p4',
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    "accounts",
    "courses",
    "enrollments",
    "lessons",
    "assessments",
    "assignments",
    "progress",
    "certificates",
    "discussions",
    "notifications",
    "messaging",
    "live_classes",
    "payments",
    "reviews",
    "support",
    "reports",
    "groups",
]

AUTH_USER_MODEL = 'accounts.User'

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases
# Defaults to SQLite for zero-config local development. Set DATABASE_URL-style
# env vars (see .env.example) to point at PostgreSQL in staging/production.

if os.getenv('DB_ENGINE') == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'asa_academy'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'accounts.validators.ComplexityValidator',
    },
]

# Argon2id first (Authentication.md SEC-001) — existing PBKDF2 hashes (from
# users created before this setting was added) keep working and are
# transparently upgraded to Argon2 the next time that user logs in.
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static & media files
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Email
# https://docs.djangoproject.com/en/6.1/topics/email/#topic-email-configuration

EMAIL_BACKEND = os.getenv(
    'EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend'
)
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'no-reply@asaacademy.com')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Only read when EMAIL_BACKEND is an SMTP backend — the console backend
# (the dev default) ignores these entirely, so they're safe to leave unset
# locally. Never hardcode real values here; supply them via .env / the
# environment only.
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.getenv('EMAIL_USER', os.getenv('EMAIL_HOST_USER', ''))
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASS', os.getenv('EMAIL_HOST_PASSWORD', ''))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'

# Authentication.md §7 / §17 — OTP and instructor-invitation lifecycle,
# configurable rather than hardcoded at each call site.
OTP_LENGTH = int(os.getenv('OTP_LENGTH', '6'))
OTP_EXPIRATION_MINUTES = int(os.getenv('OTP_EXPIRATION_MINUTES', '10'))
OTP_MAX_ATTEMPTS = int(os.getenv('OTP_MAX_ATTEMPTS', '5'))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv('OTP_RESEND_COOLDOWN_SECONDS', '60'))
INSTRUCTOR_INVITATION_EXPIRATION_HOURS = int(os.getenv('INSTRUCTOR_INVITATION_EXPIRATION_HOURS', '24'))


# Django REST Framework

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.StatusCheckingJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    # Authentication.md SEC-004 — brute-force / spam protection on the
    # sensitive auth endpoints. Views opt in via `throttle_scope`; every
    # other endpoint is unaffected (ScopedRateThrottle no-ops without a scope).
    'DEFAULT_THROTTLE_RATES': {
        'auth_register': '5/hour',
        'auth_login': '10/minute',
        'auth_otp_verify': '10/minute',
        'auth_otp_resend': '3/minute',
        'auth_password_reset': '5/hour',
        'auth_instructor_invite': '10/hour',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS — the React frontend runs on Vite's dev server by default. Vite falls
# back to 5174+ when 5173 is already taken (e.g. another dev server left
# running), so the default allowlist covers a small range of dev ports.
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,'
    'http://localhost:5174,http://127.0.0.1:5174,'
    'http://localhost:5175,http://127.0.0.1:5175',
).split(',')
CORS_ALLOW_CREDENTIALS = True
