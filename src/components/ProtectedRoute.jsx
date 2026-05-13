import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Usage: <ProtectedRoute role="ADMIN"> ... </ProtectedRoute>
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner" />
        <span>Loading...</span>
      </div>
    )
  }

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />

  // Logged in but wrong role
  if (role && user.role !== role) {
    const redirect = {
      CITIZEN: '/citizen/dashboard',
      ADMIN:   '/admin/dashboard',
      WORKER:  '/worker/dashboard',
    }
    return <Navigate to={redirect[user.role] || '/login'} replace />
  }

  return children
}