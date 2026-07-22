import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

const ALLOWED_ROLES = ['agent', 'admin']

export default function AgentRoute({ children }) {
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

  const canAccess = user?.is_staff || ALLOWED_ROLES.includes(user?.role)
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  return children
}
