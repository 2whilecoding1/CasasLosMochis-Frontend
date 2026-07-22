import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Common/Header'
import Footer from './components/Common/Footer'
import ToastContainer from './components/Common/ToastContainer'
import ProtectedRoute from './components/Common/ProtectedRoute'
import AgentRoute from './components/Common/AgentRoute'
import AdminRoute from './components/Common/AdminRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import PropertyDetail from './pages/PropertyDetail'
import PublishProperty from './pages/PublishProperty'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SetPassword from './pages/SetPassword'
import UserManagement from './pages/UserManagement'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import useAuthStore from './stores/authStore'

// Bloquea el resto de la app hasta que un usuario con cambio de contraseña
// pendiente (cuenta creada por un admin, o primer login por Google) defina
// una propia. El backend ya rechaza el resto de los endpoints igual, esto
// solo evita que el usuario se quede viendo pantallas rotas mientras tanto.
function RequirePasswordChangeGate({ children }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user?.must_change_password && location.pathname !== '/set-password') {
    return <Navigate to="/set-password" replace />
  }

  return children
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        <ToastContainer />
        <Header />
        <main className="flex-1">
          <RequirePasswordChangeGate>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route
              path="/publish"
              element={(
                <ProtectedRoute>
                  <PublishProperty />
                </ProtectedRoute>
              )}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route
              path="/set-password"
              element={(
                <ProtectedRoute>
                  <SetPassword />
                </ProtectedRoute>
              )}
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/leads"
              element={(
                <AgentRoute>
                  <Leads />
                </AgentRoute>
              )}
            />
            <Route
              path="/leads/:id"
              element={(
                <AgentRoute>
                  <LeadDetail />
                </AgentRoute>
              )}
            />
            <Route
              path="/admin/users"
              element={(
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              )}
            />
          </Routes>
          </RequirePasswordChangeGate>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
