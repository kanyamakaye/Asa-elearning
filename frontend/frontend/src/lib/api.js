const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

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
    const firstFieldError = data && Object.values(data).find(Array.isArray)?.[0]
    const message = data?.detail || firstFieldError || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}
