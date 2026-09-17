export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function assetUrl(path) {
  if (!path || path.startsWith('data:') || path.startsWith('http')) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export async function api(path, options = {}) {
  const token = window.localStorage.getItem('alchemist-admin-token')
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Erreur de communication avec le serveur')
  return data
}
