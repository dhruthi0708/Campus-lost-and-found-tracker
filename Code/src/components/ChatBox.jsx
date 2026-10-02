import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { api } from '../api'
import { connectSocket } from '../socket'
import { useAuth } from '../hooks/useAuth'
import { useApp } from '../hooks/useApp'
import { useToast } from '../hooks/useToast'

// Private, real-time chat for one claim (claimant, finder and staff only).
export default function ChatBox({ claim }) {
  const { currentUser } = useAuth()
  const { userById } = useApp()
  const { showToast } = useToast()
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const end = useRef(null)

  useEffect(() => {
    let alive = true
    const s = connectSocket()
    const onMsg = (m) => m.claimId === claim.id && setMsgs((p) => (p.some((x) => x.id === m.id) ? p : [...p, m]))
    const join = () => s.emit('chat:join', claim.id)
    api(`/claims/${claim.id}/messages`).then((d) => alive && setMsgs(d.messages)).catch(() => {})
    s.on('chat:message', onMsg); s.on('connect', join); join()
    return () => { alive = false; s.off('chat:message', onMsg); s.off('connect', join); s.emit('chat:leave', claim.id) }
  }, [claim.id])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [msgs])

  async function send(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText('')
    try { const d = await api(`/claims/${claim.id}/messages`, { method: 'POST', body: { body } }); setMsgs((p) => (p.some((x) => x.id === d.message.id) ? p : [...p, d.message])) }
    catch (err) { showToast(err.message, 'error'); setText(body) }
  }

  return (
    <section className="panel chat">
      <h2 className="panel__title"><MessageCircle size={16} /> Private chat</h2>
      <div className="chat__list">
        {msgs.length === 0 && <p className="muted">No messages yet. Say hello and arrange the handover.</p>}
        {msgs.map((m) => {
          const mine = m.senderId === currentUser.id
          return (
            <div key={m.id} className={`chat__msg ${mine ? 'chat__msg--mine' : ''}`}>
              {!mine && <span className="chat__name">{userById(m.senderId)?.name || 'User'}</span>}
              <p>{m.body}</p>
              <time>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          )
        })}
        <div ref={end} />
      </div>
      <form className="chat__form" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={1000} />
        <button className="btn btn--primary" aria-label="Send"><Send size={16} /></button>
      </form>
    </section>
  )
}
