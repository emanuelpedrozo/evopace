export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3334/api'
export const TOKEN_KEY = 'evopace.token'

export async function apiRequest<T>(path: string, options: RequestInit & { token?: string } = {}) {
  const { token, headers, ...requestOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `HTTP_${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json() as Promise<T>
}
