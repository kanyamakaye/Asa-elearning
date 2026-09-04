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

  async function login(email, password) {
    const data = await apiFetch('/auth/login/', {
      method: 'POST',
      body: { email, password },
    })
    setTokens({ access: data.access, refresh: data.refresh })
    setUser(data.user)
    return data.user
  }

  async function register({ username, email, password, passwordConfirm, firstName, lastName, userType }) {
    await apiFetch('/auth/register/', {
      method: 'POST',
      body: {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      },
    })
    return login(email, password)
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
        register,
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
