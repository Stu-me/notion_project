import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Prevents normal users from opening admin pages; backend middleware enforces this again securely.
function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'masterAdmin') return <Navigate to="/dashboard" replace />

  return children
}

export default AdminRoute
