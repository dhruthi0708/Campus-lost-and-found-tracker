import { Search, Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useApp } from '../hooks/useApp'
import { VerifiedBadge } from './ui'
import { useToast } from '../hooks/useToast'

export default function Navbar({ onToggleSidebar }) {
  const { currentUser, logout } = useAuth()
  const { unreadCount } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    showToast('You have been logged out.', 'success')
    navigate('/login')
  }

  return (
    <header className="navbar">
      <button className="navbar__menu-btn" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
        <span />
        <span />
        <span />
      </button>
      <Link to="/dashboard" className="navbar__brand">
        <span className="navbar__brand-mark" aria-hidden="true"><Search size={20} strokeWidth={2} /></span>
        CampusFind
      </Link>
      <div className="navbar__spacer" />
      <Link to="/notifications" className="navbar__icon-btn" aria-label={`Notifications, ${unreadCount} unread`}>
        <Bell size={19} strokeWidth={1.75} />
        {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
      </Link>
      <div className="navbar__profile">
        <button
          className="navbar__profile-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <span className="navbar__avatar">{currentUser?.name?.[0]?.toUpperCase() || '?'}</span>
          <span className="navbar__username">{currentUser?.name}</span>
          <VerifiedBadge user={currentUser} />
        </button>
        {menuOpen && (
          <div className="navbar__dropdown" onMouseLeave={() => setMenuOpen(false)}>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
            <button type="button" onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </div>
    </header>
  )
}
