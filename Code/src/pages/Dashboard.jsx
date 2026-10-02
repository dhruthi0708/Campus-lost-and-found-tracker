import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sparkles, ArrowRight } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { ItemStatus, ScoreBar, VerifiedBadge } from '../components/ui'
import { findMatches } from '../utils/match'
import { CLAIM_STATUS } from '../utils/constants'
import { formatDate, timeAgo } from '../utils/helpers'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { items, myItems, myClaims, notifications } = useApp()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const matches = useMemo(() => myItems.filter((i) => i.status !== 'Handed Over')
    .flatMap((i) => findMatches(i, items, 50).slice(0, 1).map((m) => ({ mine: i, ...m })))
    .sort((a, b) => b.score - a.score).slice(0, 3), [myItems, items])
  const active = myClaims.filter((c) => [CLAIM_STATUS.PENDING, CLAIM_STATUS.IN_REVIEW, CLAIM_STATUS.APPROVED].includes(c.status))
  const approved = myClaims.find((c) => c.status === CLAIM_STATUS.APPROVED)
  const recent = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const unread = notifications.filter((n) => !n.read).slice(0, 4)

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="hero__eyebrow">{currentUser.role} workspace</p>
          <h1>{greeting}, {currentUser.name.split(' ')[0]} <VerifiedBadge user={currentUser} /></h1>
          <p>Report, track and recover belongings across campus.</p>
        </div>
        <div className="hero__actions">
          <Link to="/report" className="btn btn--accent"><Plus size={16} /> Report item</Link>
          <Link to="/items" className="btn btn--ghost">Browse board</Link>
        </div>
      </section>

      {!currentUser.verified && <Link to="/profile" className="notice notice--warn">Your account isn't verified yet — verify to file claims. <ArrowRight size={14} /></Link>}
      {approved && <Link to={`/claims/${approved.id}`} className="notice notice--ok">Your claim for “{approved.itemName}” is approved — check your email for the one-time handover QR. <ArrowRight size={14} /></Link>}

      <div className="stat-grid">
        <StatCard label="My reports" value={myItems.length} icon="▣" tone="neutral" />
        <StatCard label="Active claims" value={active.length} icon="⏱" tone="brand" />
        <StatCard label="Smart matches" value={matches.length} icon="🔍" tone="warning" />
        <StatCard label="Items returned" value={myItems.filter((i) => i.status === 'Handed Over').length + myClaims.filter((c) => c.status === CLAIM_STATUS.RECOVERED).length} icon="✓" tone="success" />
      </div>

      <div className="dashboard-grid">
        <div className="stack">
          <section className="panel">
            <div className="panel__header"><h2 className="panel__title"><Sparkles size={14} /> Suggested matches</h2><Link to="/matches">View all</Link></div>
            {matches.length === 0 ? <p>No matches for your reports yet.</p> : (
              <div className="stack stack--sm">
                {matches.map((m) => (
                  <Link key={m.mine.id + m.item.id} to={`/items/${m.item.id}`} className="match-row">
                    <div><strong>{m.item.name}</strong><span>Matches your “{m.mine.name}”</span></div><ScoreBar score={m.score} />
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel__header"><h2 className="panel__title">Latest on campus</h2><Link to="/items">View all</Link></div>
            <div className="list">
              {recent.map((i) => (
                <Link key={i.id} to={`/items/${i.id}`} className="list__row">
                  <div><strong>{i.name}</strong><span>{i.type} · {i.location} · {formatDate(i.date)}</span></div><ItemStatus status={i.status} />
                </Link>
              ))}
            </div>
          </section>
        </div>
        <div className="stack">
          <section className="panel">
            <div className="panel__header"><h2 className="panel__title">My claims</h2><Link to="/claims">View all</Link></div>
            {myClaims.length === 0 ? <EmptyState icon="✎" title="No claims yet" message="Claim a found item from the board." /> : (
              <div className="list">
                {myClaims.slice(0, 4).map((c) => (
                  <Link key={c.id} to={`/claims/${c.id}`} className="list__row"><div><strong>{c.itemName}</strong><span>{formatDate(c.dateSubmitted)}</span></div><StatusBadge status={c.status} /></Link>
                ))}
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel__header"><h2 className="panel__title">Unread alerts</h2><Link to="/notifications">View all</Link></div>
            {unread.length === 0 ? <p>You're all caught up.</p> : (
              <div className="list">
                {unread.map((n) => <Link key={n.id} to={n.link || '/notifications'} className="list__row"><div><strong>{n.title}</strong><span>{timeAgo(n.createdAt)}</span></div></Link>)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
