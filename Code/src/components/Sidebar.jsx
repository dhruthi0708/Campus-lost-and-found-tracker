import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, FilePlus2, FileText, Sparkles, Bell, User, ScanLine, BarChart3 } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { isStaffRole } from '../utils/constants'

export default function Sidebar({ isOpen, onClose }) {
  const { unreadCount } = useApp()
  const { currentUser } = useAuth()
  const staff = isStaffRole(currentUser)
  const groups = [
    { title: 'Workspace', links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/items', label: 'Lost & Found', icon: Package },
      { to: '/report', label: 'Report Item', icon: FilePlus2 },
      { to: '/matches', label: 'Smart Match', icon: Sparkles },
      { to: '/claims', label: 'Claims', icon: FileText },
      { to: '/notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    ] },
    ...(staff ? [{ title: 'Administration', links: [
      { to: '/verify', label: 'Verify Handover', icon: ScanLine },
      ...(currentUser.role === 'admin' ? [{ to: '/admin', label: 'Analytics', icon: BarChart3 }] : []),
    ] }] : []),
    { title: 'Account', links: [{ to: '/profile', label: 'Profile', icon: User }] },
  ]
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav aria-label="Main navigation">
          {groups.map((g) => (
            <div key={g.title} className="sidebar__group">
              <p className="sidebar__title">{g.title}</p>
              <ul>
                {g.links.map(({ to, label, icon: Icon, end, count }) => (
                  <li key={to}>
                    <NavLink to={to} end={end} onClick={onClose} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
                      <span className="sidebar__icon" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
                      {label}
                      {count > 0 && <span className="sidebar__count">{count}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="sidebar__footer"><p>CampusFind · Role: {currentUser?.role}</p></div>
      </aside>
    </>
  )
}
