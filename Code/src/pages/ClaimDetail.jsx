import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Mail, ThumbsUp, ThumbsDown } from 'lucide-react'
import ChatBox from '../components/ChatBox'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { Timeline, VerifiedBadge } from '../components/ui'
import { ReviewActions } from './Claims'
import { CLAIM_STATUS, isStaffRole } from '../utils/constants'
import { formatDate } from '../utils/helpers'

export default function ClaimDetail() {
  const { id } = useParams()
  const [qr, setQr] = useState(null)
  const { claims, items, userById, deleteClaim, setClaimStatus, respondClaim, resendQr } = useApp()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const claim = claims.find((c) => c.id === id)
  const staff = isStaffRole(currentUser)
  const item = claim && items.find((i) => i.id === claim.itemId)
  const allowed = claim && (staff || claim.userId === currentUser.id || item?.userId === currentUser.id)

  if (!claim || !allowed) return <div className="page"><EmptyState icon="⚠" title="Claim not found" message="It may have been withdrawn." actionLabel="Back to claims" onAction={() => navigate('/claims')} /></div>

  const claimant = userById(claim.userId)
  const mine = claim.userId === currentUser.id
  const steps = [...claim.history.map((h) => ({ label: h.status, detail: `${h.by} · ${formatDate(h.at)}`, state: h.status === CLAIM_STATUS.REJECTED ? 'failed' : 'done' }))]
  if (![CLAIM_STATUS.RECOVERED, CLAIM_STATUS.REJECTED].includes(claim.status)) {
    steps.push({ label: claim.status === CLAIM_STATUS.APPROVED ? 'Awaiting QR handover' : 'Awaiting staff decision', state: 'current' })
  }
  const isFinder = item?.userId === currentUser.id

  return (
    <div className="page">
      <Link to="/claims" className="back-link">← All claims</Link>
      <div className="page__header">
        <div><h1>{claim.title}</h1><p className="page__subtitle">Filed {formatDate(claim.dateSubmitted)} by {claimant?.name} <VerifiedBadge user={claimant} label /></p></div>
        <StatusBadge status={claim.status} />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2 className="panel__title">Claim details</h2>
          <dl className="facts facts--one">
            <div><dt>Item</dt><dd><Link to={`/items/${claim.itemId}`}>{claim.itemName}</Link></dd></div>
            <div><dt>Statement</dt><dd>{claim.description}</dd></div>
            <div><dt>Proof of ownership</dt><dd>{claim.proof || '—'}</dd></div>
            <div><dt>Finder confirmation</dt><dd>{claim.ownerResponse === 'Pending' ? 'Waiting for the finder (Yes / No)' : claim.ownerResponse === 'Yes' ? '✅ Finder said Yes' : '❌ Finder said No'}</dd></div>
            {(claim.offerAmount > 0 || claim.offerMessage) && <div><dt>Claimant's optional offer</dt><dd>{claim.offerAmount > 0 ? `₹${claim.offerAmount}` : ''} {claim.offerMessage}</dd></div>}
            {claim.note && <div><dt>Staff note</dt><dd>{claim.note}</dd></div>}
            {item?.currentHolder && <div><dt>Collect from</dt><dd>{item.currentHolder}</dd></div>}
          </dl>
          <div className="row-actions" style={{ marginTop: '1rem' }}>
            {staff && <ReviewActions claim={claim} onReject={() => setRejecting(true)} />}
            {staff && claim.status === CLAIM_STATUS.APPROVED && <Link className="btn btn--primary btn--sm" to="/verify">Scan handover QR</Link>}
            {mine && [CLAIM_STATUS.PENDING, CLAIM_STATUS.IN_REVIEW].includes(claim.status) && (
              <button className="btn btn--danger-ghost btn--sm" onClick={() => { deleteClaim(claim.id); showToast('Claim withdrawn.', 'success'); navigate('/claims') }}>Withdraw claim</button>
            )}
          </div>
        </section>

        <div className="stack">
          {isFinder && claim.status === CLAIM_STATUS.PENDING && claim.ownerResponse === 'Pending' && (
            <section className="panel decision">
              <h2 className="panel__title">Is this the real owner?</h2>
              <p>Compare the claimant's description and proof with the item you reported. Your answer goes to staff for final verification.</p>
              <div className="row-actions">
                <button className="btn btn--success" onClick={() => respondClaim(claim.id, 'Yes')}><ThumbsUp size={16} /> Yes, matches</button>
                <button className="btn btn--danger-ghost" onClick={() => respondClaim(claim.id, 'No')}><ThumbsDown size={16} /> No, it doesn't</button>
              </div>
            </section>
          )}
          {claim.status === CLAIM_STATUS.APPROVED && (mine || staff) && (
            <section className="panel qr">
              <h2 className="panel__title"><Mail size={16} /> Handover QR sent by email</h2>
              <p>{mine ? 'We emailed you a secure, single-use QR code. Show it with your college ID at the help desk.' : 'A single-use QR was emailed to the claimant. Scan it at handover to complete the return.'}</p>
              <button className="btn btn--primary btn--sm" onClick={async () => { const r = await resendQr(claim.id); if (r?.token) setQr(r) }}>{mine ? 'Show my QR code' : 'Generate QR'}</button>{' '}
              <button className="btn btn--ghost btn--sm" onClick={() => resendQr(claim.id)}>Resend QR email</button>
              {qr && <div className="qr-box"><QRCodeSVG value={qr.token} size={220} includeMargin /><p className="muted">Single-use. Show it with your college ID at the help desk.</p></div>}
              <p className="muted">Resending invalidates any earlier QR code.</p>
            </section>
          )}
          {claim.status === CLAIM_STATUS.RECOVERED && <p className="notice notice--ok">Item handed over. This claim is complete.</p>}
          <ChatBox claim={claim} />
          <section className="panel"><h2 className="panel__title">Progress</h2><Timeline steps={steps} /></section>
        </div>
      </div>

      <Modal isOpen={rejecting} onClose={() => setRejecting(false)} title="Reject claim"
        footer={<><button className="btn btn--ghost" onClick={() => setRejecting(false)}>Cancel</button>
          <button className="btn btn--danger" onClick={async () => { await setClaimStatus(claim.id, CLAIM_STATUS.REJECTED, reason); setRejecting(false) }}>Reject</button></>}>
        <div className="form-field"><label>Reason</label><textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </Modal>
    </div>
  )
}
