import { Link } from 'react-router-dom'
import { MapPin, CalendarDays } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '../utils/constants'
import { formatCurrency, formatDate } from '../utils/helpers'
import { ItemStatus } from './ui'

export default function ItemCard({ item, onEdit, onDelete }) {
  return (
    <article className="item-card">
      <Link to={`/items/${item.id}`} className="item-card__image-link">
        <img src={item.image || PLACEHOLDER_IMAGE} alt={item.image ? item.name : 'No image provided'} className="item-card__image" loading="lazy" />
        <span className={`item-card__type ${item.type === 'Lost' ? 'item-card__type--lost' : 'item-card__type--found'}`}>{item.type}</span>
      </Link>
      <div className="item-card__body">
        <div className="item-card__row">
          <span className="item-card__category">{item.category}</span>
          <ItemStatus status={item.status} />
        </div>
        <h3 className="item-card__title"><Link to={`/items/${item.id}`}>{item.name}</Link></h3>
        {item.value > 0 && <p className="item-card__value">{formatCurrency(item.value)}</p>}
        <p className="item-card__meta"><CalendarDays size={14} /> {formatDate(item.date)}</p>
        <p className="item-card__meta"><MapPin size={14} /> {item.location}</p>
      </div>
      {(onEdit || onDelete) && (
        <div className="item-card__actions">
          {onEdit && <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(item)}>Edit</button>}
          {onDelete && <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => onDelete(item)}>Delete</button>}
        </div>
      )}
    </article>
  )
}
