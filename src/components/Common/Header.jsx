import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from './Button'
import logo from '../../assets/images/logo.png'
import useAuthStore from '../../stores/authStore'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Catálogo', to: '/catalog' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const displayName = user?.first_name || user?.username || 'Mi cuenta'
  const canSeeLeads = isAuthenticated && (user?.is_staff || user?.role === 'agent' || user?.role === 'admin')
  const canManageUsers = isAuthenticated && (user?.is_staff || user?.role === 'admin')
  const links = [
    ...navLinks,
    ...(canSeeLeads ? [{ label: 'Mis Leads', to: '/leads' }, { label: 'Contratos', to: '/contracts' }] : []),
    ...(canManageUsers ? [{ label: 'Usuarios', to: '/admin/users' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-gold-500/20 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={logo}
            alt="Casas Los Mochis"
            className="h-14 w-auto max-w-[180px] object-contain"
          />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${pathname === to
                  ? 'text-gold-400 bg-gold-500/10'
                  : 'text-silver-300 hover:text-white hover:bg-white/5'
                }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-xs text-silver-300 hidden lg:inline">Hola, {displayName}</span>
              <Button type="button" onClick={logout} variant="outline" size="sm">
                Cerrar sesion
              </Button>
            </>
          ) : (
            <Button as={Link} to="/login" variant="outline" size="sm">
              Iniciar sesion
            </Button>
          )}
          <Button as={Link} to="/publish" variant="primary" size="sm" className="hidden lg:inline-flex">
            Publicar propiedad
          </Button>
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden p-2 rounded-lg text-silver-300 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-white/10 px-4 py-3 flex flex-col gap-2">
          {links.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${pathname === to
                  ? 'text-gold-400 bg-gold-500/10'
                  : 'text-silver-300 hover:text-white hover:bg-white/5'
                }`}
            >
              {label}
            </Link>
          ))}
          <hr className="border-white/10 my-1" />
          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                logout()
                setMenuOpen(false)
              }}
            >
              Cerrar sesion
            </Button>
          ) : (
            <Button as={Link} to="/login" variant="outline" size="sm" className="w-full justify-center" onClick={() => setMenuOpen(false)}>
              Iniciar sesion
            </Button>
          )}
          <Button as={Link} to="/publish" variant="primary" size="sm" className="w-full justify-center" onClick={() => setMenuOpen(false)}>
            Publicar propiedad
          </Button>
        </div>
      )}
    </header>
  )
}
