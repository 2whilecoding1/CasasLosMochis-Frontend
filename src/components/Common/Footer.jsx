import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import devLogo from '../../assets/images/2whilelogo.png'

const LINKS = [
  { label: 'Términos y condiciones de uso', to: '/terms' },
  { label: 'Política de privacidad', to: '/privacy' },
  { label: 'Contacto', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Fila principal */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">

          {/* Logo Casas Los Mochis */}
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Casas Los Mochis" className="h-10 w-auto object-contain" />
          </Link>

          {/* Links legales */}
          <nav className="flex flex-wrap justify-center sm:justify-end gap-x-5 gap-y-2">
            {LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-xs text-silver-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <hr className="border-white/10 my-5" />

        {/* Fila inferior */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-silver-500">
          <p>© {new Date().getFullYear()} Casas Los Mochis. Todos los derechos reservados.</p>

          {/* Desarrollado por */}
          <a
            href="https://2whilecoding.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-silver-500">Desarrollado por</span>
            <img
              src={devLogo}
              alt="2WhileCoding"
              className="h-5 w-auto object-contain"
            />
          </a>
        </div>

      </div>
    </footer>
  )
}
