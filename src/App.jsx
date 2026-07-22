import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Common/Header'
import Footer from './components/Common/Footer'
import ProtectedRoute from './components/Common/ProtectedRoute'
import AgentRoute from './components/Common/AgentRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import PropertyDetail from './pages/PropertyDetail'
import PublishProperty from './pages/PublishProperty'
import Login from './pages/Login'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import useAuthStore from './stores/authStore'

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
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
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
