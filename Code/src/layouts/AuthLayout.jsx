import { Outlet } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <div className="auth-layout__brand">
          <span className="auth-layout__mark" aria-hidden="true"><Search size={22} /></span>
          <span>CampusFind</span>
        </div>
        <p className="auth-layout__tagline">Find what's lost. Reunite what's found.</p>
        <ul className="auth-layout__points">
          <li>Report items you've lost or found on campus</li>
          <li>File and track claims until items are returned</li>
          <li>Get notified the moment your item is matched</li>
        </ul>
        <div className="auth-layout__demo">
          <p>Demo accounts</p>
          <code>admin@campusfind.edu / Admin@123</code>
          <code>security@campusfind.edu / Staff@123</code>
          <code>rahul@campusfind.edu / Student@123</code>
        </div>
      </div>
      <div className="auth-layout__form">
        <Outlet />
      </div>
    </div>
  )
}
