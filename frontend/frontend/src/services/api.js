import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// Reuses the same token storage AuthContext (../context/AuthContext.jsx) already
// writes to on login/register — this client does not maintain its own auth state.
function getAccessToken() {
  try {
    const raw = localStorage.getItem('asa_tokens')
    return raw ? JSON.parse(raw)?.access ?? null : null
  } catch {
    return null
  }
}

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data
    const message =
      payload?.message ||
      payload?.detail ||
      (payload && Object.values(payload).find(Array.isArray)?.[0]) ||
      'Something went wrong. Please try again.'
    const errors = payload?.errors ?? (payload && typeof payload === 'object' ? payload : {})
    const normalized = new Error(message)
    normalized.errors = errors
    normalized.status = error.response?.status
    return Promise.reject(normalized)
  }
)

export default api
