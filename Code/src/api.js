// Tiny fetch wrapper that attaches the JWT and throws readable errors.
export const TOKEN_KEY = 'campusfind_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) { const e = new Error(data.error || 'Something went wrong.'); e.status = res.status; throw e }
  return data
}
