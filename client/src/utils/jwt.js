/**
 * Decode JWT payload and return true if expired (or invalid).
 */
export function isJwtExpired(token) {
  if (!token || typeof token !== 'string') return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    if (payload.exp == null) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}
