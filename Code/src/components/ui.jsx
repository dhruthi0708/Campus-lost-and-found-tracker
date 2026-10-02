import { BadgeCheck } from 'lucide-react'

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page__header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page__subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page__header-actions">{children}</div>}
    </div>
  )
}

export function VerifiedBadge({ user, label = false }) {
  if (!user?.verified) return null
  return <span className="vbadge" title="Verified campus member"><BadgeCheck size={14} strokeWidth={2} />{label && 'Verified'}</span>
}

export function ItemStatus({ status = 'Open' }) {
  return <span className={`istatus istatus--${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>
}

export function ScoreBar({ score }) {
  const tone = score >= 70 ? 'high' : score >= 55 ? 'mid' : 'low'
  return (
    <div className="score">
      <div className="score__track"><div className={`score__fill score__fill--${tone}`} style={{ width: `${score}%` }} /></div>
      <b>{score}%</b>
    </div>
  )
}

// steps: [{ label, detail, state: 'done' | 'current' | 'todo' | 'failed' }]
export function Timeline({ steps }) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => (
        <li key={i} className={`timeline__step timeline__step--${s.state}`}>
          <span className="timeline__dot" />
          <div>
            <p className="timeline__label">{s.label}</p>
            {s.detail && <p className="timeline__detail">{s.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function itemTimeline(item, itemClaims) {
  const approved = itemClaims.find((c) => ['Approved', 'Handed Over'].includes(c.status))
  const hasClaim = itemClaims.length > 0
  const returned = item.status === 'Handed Over'
  return [
    { label: 'Reported', detail: `${item.type} report published`, state: 'done' },
    { label: 'Claim submitted', detail: hasClaim ? `${itemClaims.length} claim(s) received` : 'Waiting for a claim', state: hasClaim ? 'done' : 'current' },
    { label: 'Claim approved', detail: approved ? 'Ownership verified by staff' : 'Pending staff verification', state: approved ? 'done' : hasClaim ? 'current' : 'todo' },
    { label: 'Returned to owner', detail: returned ? 'Handover verified via QR' : 'QR handover at help desk', state: returned ? 'done' : approved ? 'current' : 'todo' },
  ]
}
