import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

function readStored(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored('asa_user'))
  const [tokens, setTokens] = useState(() => readStored('asa_tokens'))

  useEffect(() => {
    if (tokens) localStorage.setItem('asa_tokens', JSON.stringify(tokens))
    else localStorage.removeItem('asa_tokens')
  }, [tokens])

  useEffect(() => {
    if (user) localStorage.setItem('asa_user', JSON.stringify(user))
    else localStorage.removeItem('asa_user')
  }, [user])

  // Step 1 of login (Authentication.md §16) — validates the password and
  // account status, then always returns a 2FA challenge instead of tokens.
  async function login(email, password) {
    const data = await apiFetch('/auth/login/', {
      method: 'POST',
      body: { email, password },
    })
    return { challengeId: data.challenge_id, maskedEmail: data.masked_email }
  }

  // Step 2 — the OTP emailed for that challenge. Only this call actually
  // establishes an authenticated session.
  async function completeLogin(challengeId, otp) {
    const data = await apiFetch('/auth/verify-2fa/', {
      method: 'POST',
      body: { challenge_id: challengeId, otp },
    })
    setTokens({ access: data.access, refresh: data.refresh })
    setUser(data.user)
    return data.user
  }

  // Public self-registration always creates a Student/Learner account —
  // the backend ignores any role hint the client might send. Does not log
  // the user in; the account is PENDING_VERIFICATION until they enter the
  // emailed OTP (see verifyEmail).
  async function register({ username, email, password, passwordConfirm, firstName, lastName, phoneNumber, acceptTerms, acceptPrivacyPolicy }) {
    return apiFetch('/auth/register/', {
      method: 'POST',
      body: {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || '',
        accept_terms: acceptTerms,
        accept_privacy_policy: acceptPrivacyPolicy,
      },
    })
  }

  async function verifyEmail(email, otp) {
    return apiFetch('/auth/verify-email/', { method: 'POST', body: { email, otp } })
  }

  async function verifyInstructorEmail(email, otp) {
    return apiFetch('/auth/instructor/verify-email/', { method: 'POST', body: { email, otp } })
  }

  async function resendOtp(email, purpose) {
    return apiFetch('/auth/resend-otp/', { method: 'POST', body: { email, purpose } })
  }

  async function activateInstructor(token, password, confirmPassword) {
    return apiFetch('/auth/instructor/activate/', {
      method: 'POST',
      body: { token, password, confirm_password: confirmPassword },
    })
  }

  function logout() {
    setUser(null)
    setTokens(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: tokens?.access ?? null,
        isAuthenticated: Boolean(tokens),
        login,
        completeLogin,
        register,
        verifyEmail,
        verifyInstructorEmail,
        resendOtp,
        activateInstructor,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
