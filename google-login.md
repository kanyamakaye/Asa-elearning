# ASA ACADEMY — Google Sign-In for Students

Status: **draft, for review before implementation**
Scope: "Continue with Google" on the public Login/Signup pages, students
only. Instructors/admins/staff keep email+password; the new endpoint
refuses to create or link anything but a student account.

## 1. Approach

Google Identity Services (GIS), **ID-token mode**:

1. Frontend renders Google's button (GIS script), gets back a signed **ID
   token** (no OAuth redirect, no client secret on our side).
2. Frontend `POST`s it to `POST /api/v1/auth/google/`.
3. Backend verifies the token server-side (`google-auth` lib, checks
   signature/issuer/`aud`/expiry), gets-or-creates a **student** `User`,
   returns `{access, refresh, user}` — same shape `/auth/login/` already
   returns.
4. Frontend stores it exactly like `AuthContext.login()` does today (same
   `asa_tokens`/`asa_user` keys). Everything downstream (routing, JWT auth)
   is unchanged.

## 2. Data model

Add to `accounts.User` (migration, nullable — no impact on existing rows):

```python
google_id = models.CharField(max_length=64, unique=True, null=True, blank=True)  # Google's `sub`
auth_provider = models.CharField(max_length=20, choices=[('password', ...), ('google', ...)], default='password')
```

## 3. Backend

- **Dep**: `google-auth` in `requirements.txt`.
- **Setting**: `GOOGLE_CLIENT_ID` (env var), same value the frontend uses.
- **`POST /api/v1/auth/google/`** (`AllowAny`, like `/auth/login/`), body
  `{ "credential": "<GIS ID token>" }`.
- **`GoogleAuthSerializer.validate()`**:
  1. `id_token.verify_oauth2_token(credential, Request(), GOOGLE_CLIENT_ID)`
     → verifies signature/`iss`/`aud`/`exp`. `ValueError` → 400.
  2. Require `email_verified: true` in the payload.
  3. Resolve user:
     - `google_id` match → that user.
     - else email match, `user_type != student` → **403**, "linked to a
       non-student account, use standard login."
     - else email match, student, unlinked → link `google_id`, set
       `email_verified=True`.
     - else → create student `User` (`email_verified=True`,
       `auth_provider='google'`, `set_unusable_password()`, username
       generated from email), plus `StudentProfile` (mirrors
       `RegisterSerializer.create()`).
- **`GoogleLoginView`**: issue SimpleJWT tokens with the same custom claims
  as `CustomTokenObtainPairSerializer`, write a `LoginHistory` row, return
  `{access, refresh, user: UserSerializer(user).data}`.
- **URL**: `accounts/urls.py` → `auth/google/`.
- **Tests**: mock `verify_oauth2_token` — new user, link existing student,
  reject non-student, replay same `sub`, invalid token, unverified email.

## 4. Frontend

- `index.html`: `<script src="https://accounts.google.com/gsi/client" async defer>`.
- `VITE_GOOGLE_CLIENT_ID` env var (same ID as backend's).
- New `GoogleSignInButton.jsx`: inits GIS with the client ID, renders
  Google's button, calls `onCredential(credential)` on success. Hidden if
  no client ID configured.
- `AuthContext.jsx`: add `loginWithGoogle(credential)` — POSTs to
  `/auth/google/`, sets tokens/user same as `login()`.
- `Login.jsx` / `Register.jsx`: add the button + divider, wire to
  `loginWithGoogle`, same loading/error handling pattern as the existing
  submit handler.

## 5. Security

- Token verified **server-side only**; frontend never trusts its contents.
- `aud` pinned to `GOOGLE_CLIENT_ID` (blocks cross-app token replay).
- Account linking only by verified email, only into a **student** account —
  never into staff/instructor/admin.
- Google-only accounts get `set_unusable_password()`, so password login
  correctly rejects them until "forgot password" is used.
- No CORS changes needed (same-origin POST from the SPA).

## 6. Manual setup (outside this repo, needed before it can work end-to-end)

Google Cloud Console → Credentials → OAuth client ID → Web application →
add dev origins (`http://localhost:5173` etc.) → no redirect URI needed →
drop the client ID into `backend/.env` (`GOOGLE_CLIENT_ID`) and
`frontend/frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

## 7. Checklist

- [ ] `google-auth` dependency + migration (`google_id`, `auth_provider`)
- [ ] `GoogleAuthSerializer` + `GoogleLoginView` + URL + tests
- [ ] `GoogleSignInButton` + `AuthContext.loginWithGoogle`
- [ ] Wire into `Login.jsx` / `Register.jsx`
- [ ] `.env.example` entries (backend + frontend)
- [ ] Manual end-to-end check with a real Google account

## 8. Open questions

1. Button on **both** Login and Register, or Login only? Default: both.
2. Existing password student clicks Google with same email → **auto-link**
   (default) vs. require an explicit confirm step first?

Proceeding on the stated defaults unless you want them changed.
