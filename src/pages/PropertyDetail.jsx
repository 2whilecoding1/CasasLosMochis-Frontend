import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import propertyService from '../services/propertyService'

const TRANSACTION_LABEL = {
  sale: { text: 'Venta', color: 'bg-gold-500' },
  rent: { text: 'Renta', color: 'bg-blue-500' },
  both: { text: 'Venta y Renta', color: 'bg-gold-500' },
}

function formatPrice(value) {
  const num = Number(value)
  if (!num) return null
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(num)
}

export default function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await propertyService.getPropertyDetail(id)
        if (mounted) {
          setProperty(data)
          setActiveImage(0)
        }
        propertyService.incrementViews(id).catch(() => {})
      } catch {
        if (mounted) setError('No se pudo cargar esta propiedad.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <p className="text-silver-400 text-lg font-medium">Cargando propiedad...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-silver-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-silver-500 text-lg font-medium">
          {error || 'No encontramos esta propiedad.'}
        </p>
        <Button as={Link} to="/catalog" variant="primary">
          Volver al catálogo
        </Button>
      </div>
    )
  }

  const images = property.images || []
  const mainImage = images[activeImage] ?? images[0] ?? null
  const isRent = property.transaction_type === 'rent'
  const salePrice = formatPrice(property.sale_price)
  const rentPrice = formatPrice(property.rent_price)
  const badge = TRANSACTION_LABEL[property.transaction_type] ?? TRANSACTION_LABEL.sale

  const specs = [
    { label: 'Recámaras', value: property.bedrooms },
    { label: 'Baños', value: property.bathrooms },
    { label: 'Construcción', value: property.construction_size ? `${property.construction_size} m²` : null },
    { label: 'Terreno', value: property.land_size ? `${property.land_size} m²` : null },
    { label: 'Salas', value: property.living_areas },
    { label: 'Cocinas', value: property.kitchens },
  ].filter((s) => s.value != null && s.value !== '')

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1 text-sm text-silver-500 hover:text-[#1a1a1a] mb-4 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Columna principal: galería + detalles */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Galería */}
            <Card className="overflow-hidden">
              <div className="relative h-64 sm:h-80 lg:h-96 bg-silver-100">
                {mainImage ? (
                  <img
                    src={mainImage.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-silver-400 gap-2">
                    <svg viewBox="0 0 24 24" className="w-14 h-14 fill-current">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    <span className="text-sm">Sin imágenes</span>
                  </div>
                )}
                <span className={`absolute top-3 left-3 ${badge.color} text-[#1a1a1a] text-xs font-bold px-3 py-1 rounded-full`}>
                  {badge.text}
                </span>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id ?? idx}
                      onClick={() => setActiveImage(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === activeImage ? 'border-gold-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img.image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Título y ubicación */}
            <div>
              <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl lg:text-4xl">
                {property.title}
              </h1>
              <p className="text-silver-500 mt-1">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <Card className="p-4 sm:p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <p className="text-xs text-silver-400 uppercase tracking-wide">{s.label}</p>
                      <p className="text-lg font-semibold text-[#1a1a1a]">{s.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Descripción */}
            <Card className="p-4 sm:p-5">
              <h2 className="font-semibold text-[#1a1a1a] mb-2">Descripción</h2>
              <p className="text-silver-600 whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </Card>

            {/* Amenidades */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="p-4 sm:p-5">
                <h2 className="font-semibold text-[#1a1a1a] mb-3">Amenidades</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a.id}
                      className="text-sm bg-silver-100 text-silver-700 px-3 py-1.5 rounded-full"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Columna lateral: precio + contacto */}
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 lg:sticky lg:top-6 flex flex-col gap-4">
              <div>
                {salePrice && (
                  <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] font-serif">
                    {salePrice}
                  </p>
                )}
                {rentPrice && (
                  <p className={`font-bold text-[#1a1a1a] font-serif ${salePrice ? 'text-lg mt-1' : 'text-2xl sm:text-3xl'}`}>
                    {rentPrice}
                    <span className="text-sm font-normal text-silver-500">/mes</span>
                  </p>
                )}
                {property.property_type_name && (
                  <p className="text-sm text-silver-500 mt-2">{property.property_type_name}</p>
                )}
              </div>

              <a
                href={`https://wa.me/526681234567?text=${encodeURIComponent(
                  `Hola, me interesa la propiedad: ${property.title}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                  bg-[#25d366] hover:bg-[#1fbd58] text-white font-semibold transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Contactar por WhatsApp
              </a>

              <Button as={Link} to="/contact" variant="outline" className="w-full">
                Enviar mensaje
              </Button>

              {property.owner && (
                <p className="text-xs text-silver-400 text-center pt-1 border-t border-silver-100">
                  Publicado por {property.owner}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
