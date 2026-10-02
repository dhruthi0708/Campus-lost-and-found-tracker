import { Search, Package, Clock, Check, FileText, User } from 'lucide-react'

const ICONS = { '🔍': Search, '🎒': Package, '⏱': Clock, '✓': Check, '✎': FileText, '▣': Package, '◍': User }

export default function StatCard({ label, value, icon, tone = 'neutral' }) {
  const Icon = ICONS[icon] || Package
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.75} /></div>
      <div>
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__label">{label}</p>
      </div>
    </div>
  )
}
