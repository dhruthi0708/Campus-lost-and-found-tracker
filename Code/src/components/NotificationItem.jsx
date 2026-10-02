import { timeAgo } from '../utils/helpers'

export default function NotificationItem({ notification, onMarkRead }) {
  const { title, message, read, createdAt } = notification
  return (
    <div className={`notification-item ${read ? '' : 'notification-item--unread'}`}>
      <span className="notification-item__dot" aria-hidden="true" />
      <div className="notification-item__content">
        <p className="notification-item__title">{title}</p>
        <p className="notification-item__message">{message}</p>
        <p className="notification-item__time">{timeAgo(createdAt)}</p>
      </div>
      {!read && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onMarkRead(notification.id)}>
          Mark as read
        </button>
      )}
    </div>
  )
}
