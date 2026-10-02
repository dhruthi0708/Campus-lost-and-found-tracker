import { CLAIM_STATUS } from '../utils/constants'

const STATUS_CLASS = {
  [CLAIM_STATUS.PENDING]: 'badge--pending',
  [CLAIM_STATUS.IN_REVIEW]: 'badge--review',
  [CLAIM_STATUS.APPROVED]: 'badge--approved',
  [CLAIM_STATUS.RECOVERED]: 'badge--recovered',
  [CLAIM_STATUS.REJECTED]: 'badge--rejected',
}

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${STATUS_CLASS[status] || 'badge--pending'}`}>{status}</span>
}
