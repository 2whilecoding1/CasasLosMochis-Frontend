import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import contractService from '../services/contractService'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

const STATUS_LABEL = {
  draft: 'Borrador',
  pending: 'Pendiente de firma',
  signed: 'Firmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const STATUS_BADGE = {
  draft: 'bg-silver-100 text-silver-600',
  pending: 'bg-amber-100 text-amber-700',
  signed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function formatCurrency(value) {
  const num = Number(value)
  if (!num) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num)
}

export default function Contracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      contract_type: 'sale', property: '', buyer: '', agent: '',
      start_date: '', end_date: '', amount: '', payment_terms: '', notes: '',
    },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await contractService.getContracts()
      const items = Array.isArray(payload) ? payload : payload?.results || []
      setContracts(items)
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudieron cargar los contratos.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = { ...data }
      if (!payload.end_date) delete payload.end_date
      if (!payload.property) delete payload.property
      if (!payload.buyer) delete payload.buyer
      if (!payload.agent) delete payload.agent
      await contractService.createContract(payload)
      toast.success('Contrato creado correctamente.')
      reset()
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo crear el contrato.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl">
            Contratos
          </h1>
          <Button type="button" variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : 'Nuevo contrato'}
          </Button>
        </div>

        {showForm && (
          <Card className="p-4 sm:p-5 mb-6">
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Tipo <span className="text-red-500">*</span></label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('contract_type', { required: true })}>
                  <option value="sale">Venta</option>
                  <option value="rent">Renta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Monto <span className="text-red-500">*</span></label>
                <input
                  type="number" step="0.01"
                  className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm"
                  {...register('amount', { required: 'El monto es obligatorio' })}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">ID de propiedad</label>
                <input type="number" className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('property')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">ID de lead (comprador)</label>
                <input type="number" className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('buyer')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Fecha inicio <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm"
                  {...register('start_date', { required: 'La fecha de inicio es obligatoria' })}
                />
                {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Fecha fin (renta)</label>
                <input type="date" className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('end_date')} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Términos de pago</label>
                <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('payment_terms')} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear contrato'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <p className="text-silver-400 text-center py-10">Cargando contratos...</p>
        ) : contracts.length === 0 ? (
          <p className="text-silver-400 text-center py-10">No hay contratos todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((c) => (
              <Card key={c.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {c.contract_type === 'sale' ? 'Venta' : 'Renta'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status] ?? 'bg-silver-100 text-silver-600'}`}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>
                <p className="text-lg font-semibold text-[#1a1a1a]">{formatCurrency(c.amount)}</p>
                <p className="text-xs text-silver-500">{c.property_title || 'Sin propiedad'}</p>
                <p className="text-xs text-silver-500">Comprador: {c.buyer_name || '—'}</p>
                <p className="text-xs text-silver-400">Agente: {c.agent_name || '—'}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
