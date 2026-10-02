import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { connectSocket } from '../socket'
import { AuthContext } from './AuthContext'
import { ToastContext } from './ToastContext'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { currentUser, users, setUsers } = useContext(AuthContext)
  const { showToast } = useContext(ToastContext)
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [notifications, setNotifications] = useState([])
  const me = currentUser?.id
  const timer = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const d = await api('/bootstrap')
      setItems(d.items); setClaims(d.claims); setNotifications(d.notifications); setUsers(d.users)
    } catch { /* offline or logged out */ }
  }, [setUsers])

  // Load data + open the realtime socket once logged in
  useEffect(() => {
    if (!me) { setItems([]); setClaims([]); setNotifications([]); return }
    refresh()
    const s = connectSocket()
    const onSync = () => { clearTimeout(timer.current); timer.current = setTimeout(refresh, 150) }
    const onNotif = (n) => {
      setNotifications((p) => (p.some((x) => x.id === n.id) ? p : [n, ...p]))
      showToast(`${n.title}: ${n.message}`, 'info')
    }
    s.on('sync', onSync); s.on('notification', onNotif); s.on('connect', refresh)
    return () => { s.off('sync', onSync); s.off('notification', onNotif); s.off('connect', refresh) }
  }, [me]) // eslint-disable-line

  const myItems = useMemo(() => items.filter((i) => i.userId === me), [items, me])
  const myClaims = useMemo(() => claims.filter((c) => c.userId === me), [claims, me])
  const unreadCount = notifications.filter((n) => !n.read).length
  const userById = (id) => users.find((u) => u.id === id)

  // Runs a server call; shows the real error and re-syncs from the database on failure.
  async function run(fn, okMsg) {
    try { const r = await fn(); if (okMsg) showToast(okMsg, 'success'); return r ?? true }
    catch (e) { showToast(e.message, 'error'); refresh(); return false }
  }

  // ---- Items (optimistic UI, server is the source of truth) ----
  function addItem(data) {
    const item = { id: crypto.randomUUID(), userId: me, status: 'Open', createdAt: new Date().toISOString(), ...data }
    setItems((p) => [item, ...p])
    run(() => api('/items', { method: 'POST', body: item }))
    return item
  }
  const updateItem = (id, data) => { setItems((p) => p.map((i) => (i.id === id ? { ...i, ...data } : i))); run(() => api(`/items/${id}`, { method: 'PATCH', body: data })) }
  const deleteItem = (id) => { setItems((p) => p.filter((i) => i.id !== id)); run(() => api(`/items/${id}`, { method: 'DELETE' })) }
  const iFoundIt = (id) => run(() => api(`/items/${id}/found-it`, { method: 'POST' }), 'The owner has been notified.')

  // ---- Claims ----
  function addClaim(data) {
    const claim = { id: crypto.randomUUID(), userId: me, status: 'Pending', ownerResponse: 'Pending', dateSubmitted: new Date().toISOString(), note: '', history: [], ...data }
    setClaims((p) => [claim, ...p])
    run(() => api('/claims', { method: 'POST', body: { id: claim.id, itemId: data.itemId, description: data.description, proof: data.proof, offerAmount: data.offerAmount, offerMessage: data.offerMessage } }))
    return claim
  }
  const respondClaim = async (id, answer) => { const ok = await run(() => api(`/claims/${id}/respond`, { method: 'POST', body: { answer } }), `You answered ${answer}.`); await refresh(); return ok }
  const setClaimStatus = async (id, status, note = '') => { const ok = await run(() => api(`/claims/${id}/status`, { method: 'POST', body: { status, note } })); await refresh(); return !!ok }
  const deleteClaim = (id) => { setClaims((p) => p.filter((c) => c.id !== id)); run(() => api(`/claims/${id}`, { method: 'DELETE' })) }
  const resendQr = (id) => run(() => api(`/claims/${id}/resend-qr`, { method: 'POST' }), 'A fresh one-time QR was emailed. Older QR codes no longer work.')
  const verifyHandover = async (token) => { try { const r = await api('/handover/verify', { method: 'POST', body: { token } }); refresh(); return { ok: true, ...r } } catch (e) { return { ok: false, error: e.message } } }

  // ---- Notifications ----
  const markNotificationRead = (id) => { setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n))); run(() => api('/notifications/read', { method: 'POST', body: { id } })) }
  const markAllNotificationsRead = () => { setNotifications((p) => p.map((n) => ({ ...n, read: true }))); run(() => api('/notifications/read', { method: 'POST', body: {} })) }
  const clearNotifications = () => { setNotifications([]); run(() => api('/notifications', { method: 'DELETE' })) }

  return (
    <AppContext.Provider value={{
      items, myItems, claims, myClaims, notifications, unreadCount, userById, refresh,
      addItem, updateItem, deleteItem, iFoundIt, addClaim, respondClaim, setClaimStatus, deleteClaim, resendQr, verifyHandover,
      markNotificationRead, markAllNotificationsRead, clearNotifications,
    }}>
      {children}
    </AppContext.Provider>
  )
}
