import { useEffect, useMemo, useState } from 'react'
import PropertyCard from '../components/Catalog/PropertyCard'
import FilterPanel from '../components/Catalog/FilterPanel'
import propertyService from '../services/propertyService'
import { toast } from '../stores/toastStore'

// Si la API no devuelve propiedades, no usamos datos mock — mostrar catálogo vacío.

const EMPTY_FILTERS = { operation: '', type: '', priceRange: '', bedrooms: '', search: '' }

function mapType(typeName = '') {
  const t = typeName.toLowerCase()
  if (t.includes('depart')) return 'apartment'
  if (t.includes('terreno')) return 'land'
  if (t.includes('local') || t.includes('comercial')) return 'commercial'
  return 'house'
}

function mapApiProperty(item) {
  const isRent = item.transaction_type === 'rent'
  const price = Number(isRent ? item.rent_price : item.sale_price) || Number(item.sale_price) || Number(item.rent_price) || 0

  const imgs = (item.images && Array.isArray(item.images) && item.images.length > 0)
    ? item.images.map((img) => img.image).filter(Boolean)
    : (item.main_image?.image ? [item.main_image.image] : [])

  return {
    id: item.id,
    title: item.title,
    price,
    operation: isRent ? 'rent' : 'sale',
    type: mapType(item.property_type_name),
    city: item.city,
    colony: item.address || item.city,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area_m2: item.construction_size ? Number(item.construction_size) : null,
    images: imgs,
  }
}

function matchesPriceRange(price, range) {
  if (!range) return true
  const [min, max] = range.split('-')
  if (min && price < Number(min)) return false
  if (max && price > Number(max)) return false
  return true
}

export default function Catalog() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      try {
        const payload = await propertyService.getProperties()
        const items = Array.isArray(payload) ? payload : payload?.results || []
        if (mounted && items.length > 0) {
          setProperties(items.map(mapApiProperty))
        } else if (mounted) {
          // No hay propiedades publicadas — dejamos el catálogo vacío
          setProperties([])
        }
      } catch {
        if (mounted) {
          // En caso de error de API, dejamos el catálogo vacío y avisamos
          setProperties([])
          toast.error('No se pudo cargar el catálogo de propiedades.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.operation && p.operation !== filters.operation) return false
      if (filters.type && p.type !== filters.type) return false
      if (!matchesPriceRange(p.price, filters.priceRange)) return false
      if (filters.bedrooms && (p.bedrooms ?? 0) < Number(filters.bedrooms)) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const hay = `${p.title} ${p.colony} ${p.city}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [filters, properties])

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Encabezado */}
        <div className="mb-5 sm:mb-6">
          <h1 className="font-['Playfair_Display'] font-bold text-[#1a1a1a]
            text-2xl sm:text-3xl lg:text-4xl">
            Catálogo de Propiedades
          </h1>
          <p className="text-silver-500 mt-1 text-sm sm:text-base">
            {filtered.length} {filtered.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 sm:mb-8">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        {/* Grid de propiedades */}
        {loading ? (
          <div className="text-center py-20 text-silver-400">
            <p className="text-base sm:text-lg font-medium">Cargando propiedades...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-silver-400">
            <svg viewBox="0 0 24 24" className="w-14 h-14 sm:w-16 sm:h-16 fill-current mx-auto mb-4 opacity-40">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <p className="text-base sm:text-lg font-medium">No se encontraron propiedades</p>
            <p className="text-sm mt-1">Intenta ajustar los filtros</p>
          </div>
        )}
      </div>
    </div>
  )
}
