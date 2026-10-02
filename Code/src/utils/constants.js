export const STORAGE_KEYS = {
  USERS: 'campusfind_users',
  CURRENT_USER: 'campusfind_current_user',
  ITEMS: 'campusfind_items_v2',
  CLAIMS: 'campusfind_claims_v2',
  NOTIFICATIONS: 'campusfind_notifications_v2',
  SEEDED: 'campusfind_seeded_v2',
}

export const CLAIM_STATUS = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  RECOVERED: 'Handed Over',
  REJECTED: 'Rejected',
}

export const CLAIM_STATUSES = Object.values(CLAIM_STATUS)

export const ITEM_TYPES = ['Lost', 'Found']

export const ITEM_CATEGORIES = [
  'ID Card',
  'Phone',
  'Wallet',
  'Books',
  'Bags',
  'Keys',
  'Electronics',
  'Other',
]

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#eef1f5"/>
    <g fill="#b7c0cc">
      <circle cx="200" cy="120" r="34"/>
      <path d="M120 230 q80-90 160 0 z"/>
    </g>
    <text x="200" y="270" font-family="sans-serif" font-size="15" fill="#8f99a8" text-anchor="middle">No image provided</text>
  </svg>`)

export const ITEM_STATUSES = ['Open', 'Claimed', 'Handed Over']

export const CAMPUS_LOCATIONS = [
  'Central Library', 'Canteen, Block B', 'Sports Complex', 'Academic Block A', 'Academic Block B',
  'Computer Lab 3, CSE Block', 'Hostel B Parking', 'Auditorium', 'Exam Hall 2', 'Main Gate / Bus Stop',
]

export const isStaffRole = (u) => u?.role === 'admin' || u?.role === 'staff'
