import { Link } from 'react-router-dom'
import { useState } from 'react'
import Card from '../Common/Card'
import Button from '../Common/Button'

const OPERATION_LABEL = {
  rent: { text: 'Renta', color: 'bg-blue-500' },
  sale: { text: 'Venta', color: 'bg-gold-500' },
}

const TYPE_LABEL = {
  house: 'Casa',
  apartment: 'Departamento',
  land: 'Terreno',
  commercial: 'Local comercial',
}

export default function PropertyCard({ property }) {
  const {
    id,
    title,
    price,
    operation,
    type,
    city,
    colony,
    bedrooms,
    bathrooms,
    area_m2,
    images = [],
  } = property

  const badge = OPERATION_LABEL[operation] ?? OPERATION_LABEL.sale
  const [index, setIndex] = useState(0)
  const mainImage = images[index] ?? null
  const hasMultiple = images && images.length > 1

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <Card className="overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {/* Imagen */}
      <div className="relative h-44 sm:h-48 lg:h-52 bg-silver-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-silver-400 gap-2">
            <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 fill-current">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs sm:text-sm">Sin imagen</span>
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
              aria-label="Anterior"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#1a1a1a]">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
              aria-label="Siguiente"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#1a1a1a]">
                <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer ${idx === index ? 'bg-white' : 'bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
        {/* Badge operación */}
        <span className={`absolute top-2.5 left-2.5 ${badge.color} text-[#1a1a1a] text-xs font-bold px-2.5 py-1 rounded-full`}>
          {badge.text}
        </span>
        {/* Badge tipo */}
        {type && (
          <span className="absolute top-2.5 right-2.5 bg-[#1a1a1a]/70 text-white text-xs px-2.5 py-1 rounded-full">
            {TYPE_LABEL[type] ?? type}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
        {/* Precio */}
        <div>
          <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a] font-serif">
            {formattedPrice}
            {operation === 'rent' && (
              <span className="text-xs sm:text-sm font-normal text-silver-500">/mes</span>
            )}
          </p>
          <p className="text-xs sm:text-sm text-silver-500 mt-0.5 truncate">
            {colony}, {city}
          </p>
        </div>

        {/* Título */}
        <h3 className="text-xs sm:text-sm font-medium text-[#1a1a1a] line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-silver-600 border-t border-silver-100 pt-2.5 sm:pt-3">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0">
                <path d="M20 9.557V3h-2v2H6V3H4v6.557C2.81 10.25 2 11.525 2 13v4h1l1 3h1l1-3h12l1 3h1l1-3h1v-4c0-1.475-.81-2.75-2-3.443zM18 7v2h-5V7h5zM6 7h5v2H6V7zm14 8H4v-2c0-1.103.897-2 2-2h12c1.103 0 2 .897 2 2v2z" />
              </svg>
              {bedrooms} rec.
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0">
                <path d="M21 10H7V7c0-.551.449-1 1-1s1 .449 1 1h2c0-1.654-1.346-3-3-3S5 5.346 5 7v3H3a1 1 0 0 0-1 1v2c0 2.606 1.674 4.823 4 5.65V22h2v-3h8v3h2v-3.35c2.326-.827 4-3.044 4-5.65v-2a1 1 0 0 0-1-1z" />
              </svg>
              {bathrooms} baños
            </span>
          )}
          {area_m2 != null && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0">
                <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98z" />
              </svg>
              {area_m2} m²
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-0.5">
          <Button
            as={Link}
            to={`/property/${id}`}
            variant="primary"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            Ver detalles
          </Button>
          <a
            href={`https://wa.me/526681234567?text=Hola, me interesa la propiedad: ${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 sm:gap-1.5
              px-2.5 sm:px-3 py-1.5 rounded-lg
              bg-[#25d366] hover:bg-[#1fbd58] text-white
              text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </Card>
  )
}
