import { Link } from 'react-router-dom'
import Button from '../components/Common/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gold-50 to-white">

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="font-serif font-bold text-[#1a1a1a]
          text-3xl sm:text-4xl md:text-5xl lg:text-6xl
          leading-tight mb-4 sm:mb-6">
          Encuentra tu hogar<br className="hidden sm:block" /> perfecto en{' '}
          <span className="text-gold-500">Los Mochis</span>
        </h1>
        <p className="text-silver-600 max-w-xl mx-auto mb-8
          text-base sm:text-lg lg:text-xl">
          Casas, departamentos y terrenos en venta y renta. La plataforma inmobiliaria de confianza en Sinaloa.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button as={Link} to="/catalog" variant="primary" size="lg">
            Ver catálogo
          </Button>
          <Button as={Link} to="/publish" variant="outline" size="lg">
            Publicar propiedad
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-silver-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: '200+', label: 'Propiedades activas' },
              { value: '150+', label: 'Clientes satisfechos' },
              { value: '10+', label: 'Años de experiencia' },
              { value: '2', label: 'Ciudades' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-serif font-bold text-gold-500
                  text-3xl sm:text-4xl lg:text-5xl mb-1">
                  {value}
                </p>
                <p className="text-silver-500 text-sm sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de propiedad */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-serif font-bold text-[#1a1a1a] text-center
          text-2xl sm:text-3xl mb-8 sm:mb-10">
          ¿Qué estás buscando?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: '🏠', label: 'Casas', type: 'house' },
            { icon: '🏢', label: 'Departamentos', type: 'apartment' },
            { icon: '🌿', label: 'Terrenos', type: 'land' },
            { icon: '🏪', label: 'Locales', type: 'commercial' },
          ].map(({ icon, label, type }) => (
            <Link
              key={type}
              to={`/catalog?type=${type}`}
              className="flex flex-col items-center gap-3 p-5 sm:p-6
                bg-white rounded-xl border border-silver-200 shadow-sm
                hover:border-gold-400 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-3xl sm:text-4xl">{icon}</span>
              <span className="font-medium text-[#1a1a1a] text-sm sm:text-base
                group-hover:text-gold-600 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
