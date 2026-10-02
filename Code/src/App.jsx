import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Items from './pages/Items'
import ItemDetail from './pages/ItemDetail'
import Claims from './pages/Claims'
import ClaimDetail from './pages/ClaimDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Report from './pages/Report'
import Matches from './pages/Matches'
import Verify from './pages/Verify'
import Admin from './pages/Admin'
import { useAuth } from './hooks/useAuth'
import { isStaffRole } from './utils/constants'
import NotFound from './pages/NotFound'
import Landing from './pages/Landing'

function Home() {
  const { currentUser, loading } = useAuth()
  if (!loading && currentUser) return <Navigate to="/dashboard" replace />
  return <Landing />
}

function Role({ allow, children }) {
  const { currentUser } = useAuth()
  return allow(currentUser) ? children : <NotFound />
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/items" element={<Items />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/claims/:id" element={<ClaimDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/report" element={<Report />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/verify" element={<Role allow={isStaffRole}><Verify /></Role>} />
              <Route path="/admin" element={<Role allow={(u) => u?.role === 'admin'}><Admin /></Role>} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
