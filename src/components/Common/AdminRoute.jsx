import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function AdminRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-silver-500 text-sm">
        Verificando sesion...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const canAccess = user?.is_staff || user?.role === 'admin'
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  return children
}
