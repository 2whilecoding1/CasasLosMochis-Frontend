import { useEffect, useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../components/Common/Button'
import propertyService from '../services/propertyService'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const LOS_MOCHIS = [25.7946, -108.987]

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-silver-400 whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-silver-100" />
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide text-silver-500">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      {hint && !error && <p className="text-[11px] text-silver-400">{hint}</p>}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-xl border text-sm text-[#1a1a1a] placeholder:text-silver-300 bg-white
   focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-400 transition-all duration-150
   ${err ? 'border-red-300 bg-red-50/50' : 'border-silver-200 hover:border-silver-300'}`

function parseCurrency(value) {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isNaN(num) ? null : num
}

function toNumberOrNull(value) {
  if (value === '' || value == null) return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

// Centra el mapa cuando cambia `center` (solo hay una instancia de mapa)
function MapCenterHandler({ center }) {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    if (!center || center === prev.current) return
    prev.current = center
    map.setView(center, Math.max(map.getZoom() || 15, 15))
  }, [center, map])
  return null
}

function MapClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

export default function PublishProperty() {
  const [submitted, setSubmitted] = useState(false)
  const [types, setTypes] = useState([])
  const [amenities, setAmenities] = useState([])
  const [colonies, setColonies] = useState([])
  const [fetchingCp, setFetchingCp] = useState(false)
  const [cpError, setCpError] = useState('')
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [metaError, setMetaError] = useState('')
  const [createdProperty, setCreatedProperty] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [markerPos, setMarkerPos] = useState(null)
  const [reverseGeocoding, setReverseGeocoding] = useState(false)
  const fileInputRef = useRef(null)
  const previewsRef = useRef([])
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = (e, position) => {
    dragItem.current = position
    try { e.dataTransfer.effectAllowed = 'move' } catch (err) { /* some browsers */ }
  }

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position
  }

  const handleDragEnd = () => {
    const dragIndex = dragItem.current
    const hoverIndex = dragOverItem.current
    if (dragIndex == null || hoverIndex == null || dragIndex === hoverIndex) {
      dragItem.current = null
      dragOverItem.current = null
      return
    }
    setSelectedFiles((prev) => {
      const copy = Array.from(prev)
      const item = copy.splice(dragIndex, 1)[0]
      copy.splice(hoverIndex, 0, item)
      return copy
    })
    dragItem.current = null
    dragOverItem.current = null
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      transaction_type: 'sale',
      property_type: '',
      address: '',
      colony: '',
      city: '',
      state: '',
      zip_code: '',
      bedrooms: 0,
      bathrooms: 0,
      living_areas: 0,
      kitchens: 1,
      construction_size: '',
      land_size: '',
      length: '',
      width: '',
      latitude: '',
      longitude: '',
      price: '',
      amenities: [],
      description: '',
    },
  })

  useEffect(() => {
    let mounted = true
    const loadMeta = async () => {
      setLoadingMeta(true)
      setMetaError('')
      try {
        const [typesData, amenitiesData] = await Promise.all([
          propertyService.getPropertyTypes(),
          propertyService.getAmenities(),
        ])
        const typesList = Array.isArray(typesData) ? typesData : typesData?.results || []
        const amenitiesList = Array.isArray(amenitiesData) ? amenitiesData : amenitiesData?.results || []
        if (!mounted) return
        setTypes(typesList)
        setAmenities(amenitiesList)
      } catch {
        if (!mounted) return
        setMetaError('No se pudo cargar el catálogo de tipos y amenidades.')
        setTypes([])
        setAmenities([])
      } finally {
        if (mounted) setLoadingMeta(false)
      }
    }
    loadMeta()
    return () => { mounted = false }
  }, [])

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => {
        try { URL.revokeObjectURL(p) } catch (e) { /* ignore */ }
      })
      previewsRef.current = []
    }
  }, [])

  const fetchColonies = useCallback(async (cp) => {
    const digits = String(cp || '').replace(/\D/g, '')
    if (digits.length !== 5) return
    setFetchingCp(true)
    setColonies([])
    setCpError('')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    try {
      const res = await fetch(
        `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${digits}&per_page=200`,
        { signal: controller.signal }
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      const records = data.zip_codes || []
      const names = [...new Set(records.map((r) => r.d_asenta).filter(Boolean))]
      const city = records[0]?.d_ciudad || records[0]?.D_mnpio || ''
      const state = records[0]?.d_estado || ''
      setColonies(names)
      if (city) setValue('city', city)
      if (state) setValue('state', state)
      if (names.length === 0) setCpError('CP no encontrado, escribe la colonia manualmente')
    } catch {
      setCpError('No se pudo consultar el CP, escribe la colonia manualmente')
    } finally {
      clearTimeout(timeout)
      setFetchingCp(false)
    }
  }, [setValue])

  const handleMapPick = useCallback(async (lat, lng) => {
    setMarkerPos([lat, lng])
    setValue('latitude', lat.toFixed(6))
    setValue('longitude', lng.toFixed(6))

    setReverseGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'es-MX,es' } }
      )
      if (!res.ok) return
      const data = await res.json()
      const addr = data.address || {}

      const street = [addr.road, addr.house_number].filter(Boolean).join(' ')
      if (street) setValue('address', street)

      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
      if (city) setValue('city', city)

      const state = addr.state || ''
      if (state) setValue('state', state)

      const postcode = addr.postcode || ''
      if (postcode) {
        setValue('zip_code', postcode)
        await fetchColonies(postcode)
      }
    } catch {
      // ignore
    } finally {
      setReverseGeocoding(false)
    }
  }, [setValue, fetchColonies])

  const onSubmit = async (data) => {
    setSubmitError('')
    const price = parseCurrency(data.price)
    const parsedLand = toNumberOrNull(data.land_size)
    const parsedLength = toNumberOrNull(data.length)
    const parsedWidth = toNumberOrNull(data.width)
    const computedLandSize = parsedLand || (parsedLength && parsedWidth ? parsedLength * parsedWidth : null)

    const payload = {
      title: data.title,
      description: data.description || 'Sin descripción adicional',
      property_type: Number(data.property_type),
      transaction_type: data.transaction_type,
      address: data.colony ? `${data.colony}, ${data.address}` : data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code || '',
      bedrooms: Number(data.bedrooms || 0),
      bathrooms: Number(data.bathrooms || 0),
      living_areas: Number(data.living_areas || 0),
      kitchens: Number(data.kitchens || 1),
      land_size: computedLandSize,
      construction_size: toNumberOrNull(data.construction_size),
      sale_price: data.transaction_type === 'sale' ? price : null,
      rent_price: data.transaction_type === 'rent' ? price : null,
      amenities: (data.amenities || []).map((id) => Number(id)),
      status: 'available',
      featured: false,
    }

    if (data.latitude) payload.latitude = Number(data.latitude)
    if (data.longitude) payload.longitude = Number(data.longitude)

    try {
      const created = await propertyService.createProperty(payload)
      if (selectedFiles.length > 0 && created?.id) {
        try {
          await propertyService.uploadImages(created.id, selectedFiles.map((s) => s.file))
        } catch (err) {
          toast.warning(getFriendlyMessage(err, 'La propiedad se publicó, pero no se pudieron subir las imágenes.'))
        }
      }
      setCreatedProperty(created)
      setSubmitted(true)
      toast.success('Propiedad publicada correctamente.')
    } catch (error) {
      toast.error(getFriendlyMessage(error, 'No se pudo publicar la propiedad.'))
    }
  }

  // Desestructurar zip_code para fusionar onChange manualmente
  const zipCodeReg = register('zip_code')

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-silver-200 shadow-sm p-8 sm:p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-gold-500">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h2 className="font-['Playfair_Display'] font-bold text-[#1a1a1a] text-2xl mb-2">
            ¡Propiedad publicada!
          </h2>
          <p className="text-silver-500 text-sm mb-6">La publicación fue guardada correctamente.</p>
          {createdProperty?.id && (
            <p className="text-xs text-silver-400 mb-4">ID: #{createdProperty.id}</p>
          )}
          <Button as="a" href="/catalog" variant="primary" size="md" className="w-full justify-center">
            Ver catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Sticky header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-silver-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-['Playfair_Display'] font-bold text-[#1a1a1a] text-base leading-tight truncate">
              Publicar propiedad
            </h1>
            <p className="text-[11px] text-silver-400 hidden sm:block">
              Complete los datos y seleccione la ubicación en el mapa
            </p>
          </div>
          <Button
            type="submit"
            form="publish-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting || loadingMeta || types.length === 0}
            className="shrink-0"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <form id="publish-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {metaError && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {metaError}
            </div>
          )}

          {/* Información general */}
          <div className="bg-white rounded-2xl border border-silver-100 p-5 sm:p-6 flex flex-col gap-5">
            <Section title="Información general">
              <Field label="Título de la publicación" error={errors.title?.message}>
                <input
                  type="text"
                  placeholder="Ej. Casa amplia en zona norte con alberca"
                  className={inputCls(errors.title)}
                  {...register('title', { required: 'El título es obligatorio' })}
                />
              </Field>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Operación">
                  <select className={inputCls(false)} {...register('transaction_type', { required: true })}>
                    <option value="sale">Venta</option>
                    <option value="rent">Renta</option>
                  </select>
                </Field>

                <Field label="Tipo de inmueble" error={errors.property_type?.message}>
                  <select
                    className={inputCls(errors.property_type)}
                    {...register('property_type', { required: 'Selecciona un tipo' })}
                  >
                    <option value="">Selecciona</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Precio" error={errors.price?.message}>
                  <input
                    type="text"
                    placeholder="1,500,000"
                    className={inputCls(errors.price)}
                    {...register('price', {
                      required: 'El precio es obligatorio',
                      validate: (v) => parseCurrency(v) ? true : 'Precio inválido',
                    })}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-2xl border border-silver-100 p-5 sm:p-6 flex flex-col gap-5">
            <Section title="Ubicación">

              {/* CP → ciudad / estado */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field
                  label="Código Postal"
                  hint={fetchingCp ? 'Buscando colonias...' : cpError || 'Escribe el CP para autocompletar'}
                >
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="81200"
                      className={inputCls(false)}
                      {...zipCodeReg}
                      onChange={(e) => {
                        zipCodeReg.onChange(e)
                        fetchColonies(e.target.value)
                      }}
                    />
                    {fetchingCp && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-block w-3.5 h-3.5 border-2 border-silver-200 border-t-gold-400 rounded-full animate-spin" />
                    )}
                  </div>
                </Field>

                <Field label="Ciudad" error={errors.city?.message}>
                  <input
                    type="text"
                    placeholder="Los Mochis"
                    className={inputCls(errors.city)}
                    {...register('city', { required: 'Requerida' })}
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Estado" error={errors.state?.message}>
                    <input
                      type="text"
                      placeholder="Sinaloa"
                      className={inputCls(errors.state)}
                      {...register('state', { required: 'Requerido' })}
                    />
                  </Field>
                </div>
              </div>

              {/* Colonia + dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Colonia">
                  {colonies.length > 0 ? (
                    <select className={inputCls(false)} {...register('colony')}>
                      <option value="">Selecciona colonia</option>
                      {colonies.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Nombre de colonia"
                      className={inputCls(false)}
                      {...register('colony')}
                    />
                  )}
                </Field>

                <Field label="Calle y número" error={errors.address?.message}>
                  <input
                    type="text"
                    placeholder="Ej. Blvd. Jiquilpan 400"
                    className={inputCls(errors.address)}
                    {...register('address', { required: 'La dirección es obligatoria' })}
                  />
                </Field>
              </div>

              {/* Coordenadas */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitud" hint="Auto desde mapa">
                  <input type="text" placeholder="25.794600" className={inputCls(false)} {...register('latitude')} />
                </Field>
                <Field label="Longitud" hint="Auto desde mapa">
                  <input type="text" placeholder="-108.987000" className={inputCls(false)} {...register('longitude')} />
                </Field>
              </div>

              {/* Mapa único */}
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-silver-500">
                  Seleccionar en mapa
                </p>
                <div className="rounded-xl overflow-hidden border border-silver-200" style={{ height: 340 }}>
                  <MapContainer center={LOS_MOCHIS} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapCenterHandler center={markerPos} />
                    <MapClickHandler onPick={handleMapPick} />
                    {markerPos && <Marker position={markerPos} />}
                  </MapContainer>
                </div>
                <p className="text-[11px] text-silver-400">
                  {reverseGeocoding ? (
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 border-2 border-silver-200 border-t-gold-400 rounded-full animate-spin" />
                      Detectando dirección...
                    </span>
                  ) : markerPos ? (
                    <span className="font-mono">{markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}</span>
                  ) : (
                    'Haz clic en el mapa para colocar el marcador y autocompletar la dirección'
                  )}
                </p>
              </div>

            </Section>
          </div>

          {/* Características */}
          <div className="bg-white rounded-2xl border border-silver-100 p-5 sm:p-6 flex flex-col gap-5">
            <Section title="Características">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Recámaras">
                  <input type="number" min="0" className={inputCls(false)} {...register('bedrooms')} />
                </Field>
                <Field label="Baños" hint="Ej: 1.5 = baño completo + medio baño">
                  <input type="number" min="0" step="0.5" className={inputCls(false)} {...register('bathrooms')} />
                </Field>
                <Field label="Salas">
                  <input type="number" min="0" className={inputCls(false)} {...register('living_areas')} />
                </Field>
                <Field label="Cocinas">
                  <input type="number" min="1" className={inputCls(false)} {...register('kitchens')} />
                </Field>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Construcción m²">
                  <input
                    type="number" min="0" step="0.01"
                    className={inputCls(false)}
                    {...register('construction_size')}
                  />
                </Field>
                <Field label="Terreno m²">
                  <input type="number" min="0" step="0.01" className={inputCls(false)} {...register('land_size')} />
                </Field>
                <Field label="Largo m">
                  <input type="number" min="0" step="0.01" className={inputCls(false)} {...register('length')} />
                </Field>
                <Field label="Ancho m">
                  <input type="number" min="0" step="0.01" className={inputCls(false)} {...register('width')} />
                </Field>
              </div>
            </Section>
          </div>

          {/* Amenidades */}
          {amenities.length > 0 && (
            <div className="bg-white rounded-2xl border border-silver-100 p-5 sm:p-6">
              <Section title="Amenidades">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={amenity.id}
                        className="w-4 h-4 rounded border-silver-300 accent-gold-500 cursor-pointer"
                        {...register('amenities')}
                      />
                      <span className="text-sm text-silver-600 group-hover:text-[#1a1a1a] transition-colors">
                        {amenity.name}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* Descripción y fotos */}
          <div className="bg-white rounded-2xl border border-silver-100 p-5 sm:p-6 flex flex-col gap-5">
            <Section title="Descripción y fotos">
              <Field label="Descripción">
                <textarea
                  rows={4}
                  placeholder="Describe la propiedad: características destacadas, estado de conservación, entorno..."
                  className={`${inputCls(false)} resize-none`}
                  {...register('description')}
                />
              </Field>

              <Field label="Imágenes (opcional)">
                <div
                  className="border-2 border-dashed border-silver-200 rounded-xl p-6 text-center cursor-pointer hover:border-silver-300 hover:bg-silver-50/40 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      const mapped = files.map((f) => ({ id: `${Date.now()}-${f.name}`, file: f, preview: URL.createObjectURL(f) }))
                      setSelectedFiles((prev) => {
                        const next = [...prev, ...mapped]
                        // track previews for cleanup
                        previewsRef.current.push(...mapped.map((m) => m.preview))
                        return next
                      })
                      // reset input value so same file can be selected again if needed
                      e.target.value = null
                    }}
                  />
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-silver-300 mx-auto mb-2">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <p className="text-sm text-silver-400">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} imagen${selectedFiles.length > 1 ? 'es' : ''} seleccionada${selectedFiles.length > 1 ? 's' : ''}`
                      : 'Haz clic para agregar imágenes'}
                  </p>
                  {selectedFiles.length === 0 && (
                    <p className="text-[11px] text-silver-300 mt-1">JPG, PNG, WEBP</p>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((s, i) => (
                        <div
                          key={s.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, i)}
                          onDragEnter={(e) => handleDragEnter(e, i)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={handleDragEnd}
                          className="w-28 h-20 bg-silver-50 border border-silver-200 rounded-lg overflow-hidden relative select-none"
                        >
                          <img src={s.preview} alt={s.file.name} className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedFiles((prev) => {
                                const copy = [...prev]
                                if (i > 0) {
                                  const tmp = copy[i - 1]
                                  copy[i - 1] = copy[i]
                                  copy[i] = tmp
                                }
                                return copy
                              })}
                              className="bg-white/90 p-1 rounded shadow text-xs"
                              title="Mover a la izquierda"
                            >◀</button>
                            <button
                              type="button"
                              onClick={() => setSelectedFiles((prev) => {
                                const copy = [...prev]
                                if (i < copy.length - 1) {
                                  const tmp = copy[i + 1]
                                  copy[i + 1] = copy[i]
                                  copy[i] = tmp
                                }
                                return copy
                              })}
                              className="bg-white/90 p-1 rounded shadow text-xs"
                              title="Mover a la derecha"
                            >▶</button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFiles((prev) => {
                                // revoke object URL
                                URL.revokeObjectURL(s.preview)
                                previewsRef.current = previewsRef.current.filter((p) => p !== s.preview)
                                return prev.filter((x) => x.id !== s.id)
                              })
                            }}
                            className="absolute bottom-1 left-1 bg-white/90 px-2 py-0.5 rounded text-xs"
                          >Eliminar</button>
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-silver-400">Arrastra para reordenar o usa los botones ▶ ◀</div>
                  </div>
                )}
              </Field>
            </Section>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={isSubmitting || loadingMeta || types.length === 0}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar propiedad'}
          </Button>

        </form>
      </div>
    </div>
  )
}
