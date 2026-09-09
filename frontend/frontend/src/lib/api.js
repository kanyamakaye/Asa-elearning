export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// DRF field errors are usually a list (serializer validation), but a view
// that raises ValidationError({'field': 'text'}) directly (e.g. enrollment's
// "already enrolled" check) sends a bare string instead — handle both so the
// real message always reaches the user instead of falling back to generic copy.
function firstFieldError(data) {
  if (!data || typeof data !== 'object') return null
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length) return value[0]
    if (typeof value === 'string' && value) return value
  }
  return null
}

export async function apiFetch(path, { method = 'GET', body, token, headers = {} } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.detail || firstFieldError(data) || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}
