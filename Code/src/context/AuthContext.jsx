import { createContext, useCallback, useEffect, useState } from 'react'
import { api, TOKEN_KEY, getToken } from '../api'
import { disconnectSocket } from '../socket'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    api('/me').then((d) => setCurrentUser(d.user)).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false))
  }, [])

  const start = ({ token, user }) => { localStorage.setItem(TOKEN_KEY, token); setCurrentUser(user); return { ok: true, user } }
  const wrap = async (fn) => { try { return await fn() } catch (e) { return { ok: false, error: e.message } } }

  const login = (body) => wrap(async () => start(await api('/auth/login', { method: 'POST', body })))
  const register = (body) => wrap(async () => start(await api('/auth/register', { method: 'POST', body })))
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); disconnectSocket(); setCurrentUser(null); setUsers([]) }, [])
  const updateProfile = (updates) => wrap(async () => { const d = await api('/me', { method: 'PATCH', body: updates }); setCurrentUser(d.user); return { ok: true } })
  const updateUser = (id, updates) => wrap(async () => {
    await api(`/users/${id}`, { method: 'PATCH', body: updates })
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, ...updates } : u))); return { ok: true }
  })

  return (
    <AuthContext.Provider value={{ currentUser, users, setUsers, loading, login, register, logout, updateProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
