const OPERATION_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'sale', label: 'Venta' },
  { value: 'rent', label: 'Renta' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Departamento' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Local comercial' },
]

const PRICE_RANGES = [
  { value: '', label: 'Cualquier precio' },
  { value: '0-500000', label: 'Hasta $500,000' },
  { value: '500000-1000000', label: '$500k – $1M' },
  { value: '1000000-3000000', label: '$1M – $3M' },
  { value: '3000000-', label: 'Más de $3M' },
]

const BEDROOMS_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-silver-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-silver-200 rounded-lg px-3 py-2.5 sm:py-2
          text-sm text-[#1a1a1a]
          focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent
          cursor-pointer w-full"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({ filters, onChange }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })

  const hasActiveFilters =
    filters.operation || filters.type || filters.priceRange || filters.bedrooms || filters.search

  return (
    <div className="bg-white border border-silver-200 rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Búsqueda por texto */}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-silver-500 uppercase tracking-wide">
          Buscar
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-silver-400 pointer-events-none"
          >
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Colonia, ciudad, descripción..."
            value={filters.search ?? ''}
            onChange={(e) => set('search')(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 sm:py-2
              border border-silver-200 rounded-lg
              text-sm text-[#1a1a1a] placeholder:text-silver-400
              focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros en grid: 1 col móvil, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          label="Operación"
          value={filters.operation ?? ''}
          onChange={set('operation')}
          options={OPERATION_OPTIONS}
        />
        <Select
          label="Tipo"
          value={filters.type ?? ''}
          onChange={set('type')}
          options={TYPE_OPTIONS}
        />
        <Select
          label="Precio"
          value={filters.priceRange ?? ''}
          onChange={set('priceRange')}
          options={PRICE_RANGES}
        />
        <Select
          label="Recámaras"
          value={filters.bedrooms ?? ''}
          onChange={set('bedrooms')}
          options={BEDROOMS_OPTIONS}
        />
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ operation: '', type: '', priceRange: '', bedrooms: '', search: '' })}
          className="mt-3 text-xs text-gold-600 hover:text-gold-700 font-medium underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
