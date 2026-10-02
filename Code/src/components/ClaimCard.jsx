import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function ClaimCard({ claim, onEdit, onDelete }) {
  return (
    <article className="claim-card">
      <div className="claim-card__top">
        <StatusBadge status={claim.status} />
        <span className="claim-card__date">{formatDate(claim.dateSubmitted)}</span>
      </div>
      <h3 className="claim-card__title">
        <Link to={`/claims/${claim.id}`}>{claim.title}</Link>
      </h3>
      <p className="claim-card__item">For: {claim.itemName}</p>
      <p className="claim-card__desc">{claim.description}</p>
      <div className="claim-card__bottom">
        <span className="claim-card__amount">{claim.amount > 0 ? `Reward: ${formatCurrency(claim.amount)}` : 'No reward offered'}</span>
        <div className="claim-card__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(claim)}>Edit</button>
          <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => onDelete(claim)}>Delete</button>
        </div>
      </div>
    </article>
  )
}
