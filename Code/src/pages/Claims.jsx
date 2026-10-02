import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { PageHeader, VerifiedBadge } from '../components/ui'
import { CLAIM_STATUS, CLAIM_STATUSES, isStaffRole } from '../utils/constants'
import { formatDate } from '../utils/helpers'

export function ReviewActions({ claim, onReject }) {
  const { setClaimStatus } = useApp()
  const { showToast } = useToast()
  const act = async (s) => { if (await setClaimStatus(claim.id, s)) showToast(`Claim marked ${s}.`, 'success') }
  if ([CLAIM_STATUS.RECOVERED, CLAIM_STATUS.REJECTED].includes(claim.status)) return null
  return (
    <div className="row-actions">
      {claim.status === CLAIM_STATUS.PENDING && <button className="btn btn--ghost btn--sm" onClick={() => act(CLAIM_STATUS.IN_REVIEW)}>Start review</button>}
      {claim.status !== CLAIM_STATUS.APPROVED && <button className="btn btn--success btn--sm" onClick={() => act(CLAIM_STATUS.APPROVED)}>Approve</button>}
      <button className="btn btn--danger-ghost btn--sm" onClick={() => onReject(claim)}>Reject</button>
    </div>
  )
}

export default function Claims() {
  const { claims, myClaims, userById, setClaimStatus } = useApp()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const staff = isStaffRole(currentUser)
  const [tab, setTab] = useState(staff ? 'queue' : 'mine')
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')

  const list = useMemo(() => (tab === 'queue' ? claims : myClaims)
    .filter((c) => (status === 'all' || c.status === status) && `${c.title} ${c.itemName} ${userById(c.userId)?.name || ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted)), [tab, claims, myClaims, status, q]) // eslint-disable-line

  const open = claims.filter((c) => [CLAIM_STATUS.PENDING, CLAIM_STATUS.IN_REVIEW].includes(c.status)).length

  return (
    <div className="page">
      <PageHeader title="Claims" subtitle={staff ? `${open} claim${open === 1 ? '' : 's'} awaiting action.` : 'Track the claims you have filed.'} />
      {staff && (
        <div className="tabs">
          <button className={tab === 'queue' ? 'is-active' : ''} onClick={() => setTab('queue')}>Review queue</button>
          <button className={tab === 'mine' ? 'is-active' : ''} onClick={() => setTab('mine')}>My claims</button>
        </div>
      )}
      <div className="filters filters--inline">
        <input className="input" placeholder="Search claims…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {CLAIM_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="✎" title="No claims here" message="Open a found item and choose “Claim this item” to start." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Item</th><th>Claimant</th><th>Submitted</th><th>Status</th><th /></tr></thead>
            <tbody>
              {list.map((c) => {
                const u = userById(c.userId)
                return (
                  <tr key={c.id}>
                    <td data-label="Item"><Link to={`/claims/${c.id}`}><strong>{c.itemName}</strong></Link><span className="muted">{c.proof}</span></td>
                    <td data-label="Claimant">{u?.name} <VerifiedBadge user={u} /></td>
                    <td data-label="Submitted">{formatDate(c.dateSubmitted)}</td>
                    <td data-label="Status"><StatusBadge status={c.status} /></td>
                    <td>{staff && tab === 'queue' ? <ReviewActions claim={c} onReject={setRejecting} /> : <Link to={`/claims/${c.id}`} className="btn btn--ghost btn--sm">Open</Link>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Reject claim"
        footer={<><button className="btn btn--ghost" onClick={() => setRejecting(null)}>Cancel</button>
          <button className="btn btn--danger" onClick={async () => { if (await setClaimStatus(rejecting.id, CLAIM_STATUS.REJECTED, reason)) showToast('Claim rejected.', 'success'); setRejecting(null); setReason('') }}>Reject</button></>}>
        <div className="form-field"><label>Reason (shown to the claimant)</label><textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Proof details did not match." /></div>
      </Modal>
    </div>
  )
}
