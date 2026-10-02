import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, CalendarDays, Package, Sparkles, ShieldAlert } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { VerifiedBadge, ItemStatus, ScoreBar, Timeline, itemTimeline } from '../components/ui'
import { findMatches } from '../utils/match'
import { PLACEHOLDER_IMAGE, isStaffRole } from '../utils/constants'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function ItemDetail() {
  const { id } = useParams()
  const { items, claims, addClaim, iFoundIt, userById } = useApp()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ description: '', proof: '', offerAmount: '', offerMessage: '' })

  const item = items.find((i) => i.id === id)
  if (!item) return <div className="page"><EmptyState icon="⚠" title="Report not found" message="It may have been removed." actionLabel="Back to board" onAction={() => navigate('/items')} /></div>

  const owner = userById(item.userId)
  const isOwner = item.userId === currentUser.id
  const staff = isStaffRole(currentUser)
  const itemClaims = claims.filter((c) => c.itemId === item.id)
  const visibleClaims = itemClaims.filter((c) => staff || isOwner || c.userId === currentUser.id)
  const myClaim = itemClaims.find((c) => c.userId === currentUser.id)
  const matches = findMatches(item, items).slice(0, 3)
  const canClaim = item.type === 'Found' && !isOwner && !myClaim && item.status !== 'Handed Over'

  function submit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.proof.trim()) return showToast('Please describe your proof of ownership.', 'error')
    const c = addClaim({ itemId: item.id, itemName: item.name, title: `Claim: ${item.name}`, ...form, offerAmount: parseFloat(form.offerAmount) || 0 })
    setOpen(false)
    showToast('Claim submitted for review.', 'success')
    navigate(`/claims/${c.id}`)
  }

  return (
    <div className="page">
      <Link to="/items" className="back-link">← All reports</Link>
      <div className="detail-layout">
        <div className="detail-layout__media"><img src={item.image || PLACEHOLDER_IMAGE} alt={item.name} /></div>
        <div>
          <div className="item-card__row">
            <span className={`item-card__type item-card__type--inline ${item.type === 'Lost' ? 'item-card__type--lost' : 'item-card__type--found'}`}>{item.type}</span>
            <ItemStatus status={item.status} />
          </div>
          <h1 style={{ marginTop: '.6rem' }}>{item.name}</h1>
          {(item.offerAmount > 0 || item.offerMessage) && <p className="muted">🎁 Offer{item.offerAmount > 0 ? `: ${formatCurrency(item.offerAmount)}` : ''}{item.offerMessage ? ` — ${item.offerMessage}` : ''} (optional)</p>}
          {item.value > 0 && <p className="detail-layout__value">{formatCurrency(item.value)}</p>}
          <p>{item.description || 'No description provided.'}</p>
          <dl className="facts">
            <div><dt><Package size={14} /> Category</dt><dd>{item.category}</dd></div>
            <div><dt><CalendarDays size={14} /> Date</dt><dd>{formatDate(item.date)}</dd></div>
            <div><dt><MapPin size={14} /> Location</dt><dd>{item.location}</dd></div>
            {item.brand && <div><dt>Brand</dt><dd>{item.brand}</dd></div>}
            {item.color && <div><dt>Colour</dt><dd>{item.color}</dd></div>}
            {item.currentHolder && <div><dt>Stored at</dt><dd>{item.currentHolder}</dd></div>}
            <div><dt>Reported by</dt><dd>{owner?.name || 'Unknown'} <VerifiedBadge user={owner} /></dd></div>
            {(isOwner || staff) && item.identifyingMarks && <div><dt><ShieldAlert size={14} /> Private marks</dt><dd>{item.identifyingMarks}</dd></div>}
          </dl>
          <div className="detail-layout__actions">
            {canClaim && (currentUser.verified
              ? <button className="btn btn--primary" onClick={() => setOpen(true)}>Claim this item</button>
              : <Link to="/profile" className="btn btn--accent">Verify your account to claim</Link>)}
            {item.type === 'Lost' && !isOwner && item.status === 'Open' && <button className="btn btn--primary" onClick={() => iFoundIt(item.id)}>I found this item</button>}
            {myClaim && <Link to={`/claims/${myClaim.id}`} className="btn btn--ghost">View my claim</Link>}
            {(isOwner || currentUser.role === 'admin') && <Link to={`/report/${item.id}`} className="btn btn--ghost">Edit report</Link>}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2 className="panel__title">Status tracking</h2>
          <Timeline steps={itemTimeline(item, itemClaims)} />
        </section>
        <section className="panel">
          <h2 className="panel__title"><Sparkles size={14} /> Smart Match</h2>
          {matches.length === 0 ? <p>No similar reports yet. We'll notify you when one appears.</p> : (
            <div className="stack stack--sm">
              {matches.map((m) => (
                <Link key={m.item.id} to={`/items/${m.item.id}`} className="match-row">
                  <div><strong>{m.item.name}</strong><span>{m.item.type} · {m.item.location}</span></div>
                  <ScoreBar score={m.score} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {visibleClaims.length > 0 && (
        <section className="panel">
          <h2 className="panel__title">Claims ({visibleClaims.length})</h2>
          <div className="list">
            {visibleClaims.map((c) => (
              <Link key={c.id} to={`/claims/${c.id}`} className="list__row">
                <div><strong>{c.title}</strong><span>{userById(c.userId)?.name} · {formatDate(c.dateSubmitted)}</span></div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Claim this item"
        footer={<><button className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button form="claim-form" className="btn btn--primary">Submit claim</button></>}>
        <form id="claim-form" onSubmit={submit} className="stack stack--sm">
          <div className="form-field"><label>How is this yours?</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Where and when did you lose it?" /></div>
          <div className="form-field"><label>Proof only the owner would know</label><input value={form.proof} onChange={(e) => setForm({ ...form, proof: e.target.value })} placeholder="Marks, contents, lock-screen, serial number…" /></div>
          <div className="form-field"><label>Thank-you offer (₹) — optional</label><input type="number" min="0" value={form.offerAmount} onChange={(e) => setForm({ ...form, offerAmount: e.target.value })} placeholder="Optional" /></div>
          <div className="form-field"><label>Message — optional</label><input maxLength={255} value={form.offerMessage} onChange={(e) => setForm({ ...form, offerMessage: e.target.value })} placeholder="e.g. Thanks for finding it!" /></div>
          <p className="muted">Optional. Not needed to claim or collect the item.</p>
        </form>
      </Modal>
    </div>
  )
}
