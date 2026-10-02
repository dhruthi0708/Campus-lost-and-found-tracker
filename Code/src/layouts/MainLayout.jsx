import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="app-shell__body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-shell__main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
