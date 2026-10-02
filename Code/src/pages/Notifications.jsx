import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import EmptyState from '../components/EmptyState'
import { PageHeader } from '../components/ui'
import { timeAgo } from '../utils/helpers'

export default function Notifications() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp()
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()
  const list = [...notifications].filter((n) => tab === 'all' || !n.read).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const open = (n) => { markNotificationRead(n.id); if (n.link) navigate(n.link) }

  return (
    <div className="page page--narrow">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread`}>
        <button className="btn btn--ghost btn--sm" onClick={markAllNotificationsRead} disabled={!unreadCount}><Check size={14} /> Mark all read</button>
        <button className="btn btn--danger-ghost btn--sm" onClick={clearNotifications} disabled={!notifications.length}>Clear</button>
      </PageHeader>
      <div className="tabs">
        <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>All</button>
        <button className={tab === 'unread' ? 'is-active' : ''} onClick={() => setTab('unread')}>Unread</button>
      </div>
      {list.length === 0 ? <EmptyState icon="🔔" title="You're all caught up" message="Claim updates and match alerts will appear here." /> : (
        <div className="list">
          {list.map((n) => (
            <button key={n.id} className={`notif ${n.read ? '' : 'notif--unread'}`} onClick={() => open(n)}>
              <span className="notif__icon"><Bell size={16} /></span>
              <div><strong>{n.title}</strong><p>{n.message}</p><small>{timeAgo(n.createdAt)}</small></div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
