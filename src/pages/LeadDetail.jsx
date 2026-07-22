import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import leadService from '../services/leadService'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'interested', label: 'Interesado' },
  { value: 'negotiating', label: 'Negociando' },
  { value: 'closed', label: 'Cerrado' },
  { value: 'lost', label: 'Perdido' },
]

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('new')

  useEffect(() => {
    let mounted = true
    leadService.getLeadDetail(id)
      .then((data) => {
        if (!mounted) return
        setLead(data)
        setNotes(data.notes || '')
        setStatus(data.status)
      })
      .catch(() => {
        if (mounted) setLoadError('No se pudo cargar este lead.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await leadService.patchLead(id, { notes, status })
      setLead(updated)
      toast.success('Cambios guardados.')
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudieron guardar los cambios.'))
    } finally {
      setSaving(false)
    }
  }

  const handleQualify = async () => {
    setSaving(true)
    try {
      const updated = await leadService.qualifyLead(id)
      setLead(updated)
      toast.success('Lead marcado como calificado.')
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo calificar el lead.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <p className="text-silver-400 text-lg font-medium">Cargando lead...</p>
      </div>
    )
  }

  if (loadError && !lead) {
    return (
      <div className="min-h-screen bg-silver-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-silver-500 text-lg font-medium">{loadError}</p>
        <Button as={Link} to="/leads" variant="primary">Volver a leads</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1 text-sm text-silver-500 hover:text-[#1a1a1a] mb-4 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Volver a leads
        </button>

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="font-['Playfair_Display'] font-bold text-[#1a1a1a] text-2xl sm:text-3xl">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-silver-500 mt-1">{lead.email} · {lead.phone}</p>
          </div>
          {lead.is_qualified ? (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium shrink-0">
              Calificado
            </span>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={handleQualify} disabled={saving}>
              Marcar calificado
            </Button>
          )}
        </div>

        <Card className="p-4 sm:p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-silver-400 uppercase tracking-wide">Fuente</p>
              <p className="text-sm font-medium text-[#1a1a1a]">{lead.source}</p>
            </div>
            <div>
              <p className="text-xs text-silver-400 uppercase tracking-wide">Agente asignado</p>
              <p className="text-sm font-medium text-[#1a1a1a]">{lead.agent_name || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-xs text-silver-400 uppercase tracking-wide">Presupuesto</p>
              <p className="text-sm font-medium text-[#1a1a1a]">
                {lead.budget_min || lead.budget_max
                  ? `${lead.budget_min ?? '—'} - ${lead.budget_max ?? '—'}`
                  : 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-silver-400 uppercase tracking-wide">Ubicación preferida</p>
              <p className="text-sm font-medium text-[#1a1a1a]">{lead.preferred_location || '—'}</p>
            </div>
          </div>
          {lead.interested_in && (
            <div className="mt-4 pt-4 border-t border-silver-100">
              <p className="text-xs text-silver-400 uppercase tracking-wide mb-1">Busca</p>
              <p className="text-sm text-silver-600 whitespace-pre-line">{lead.interested_in}</p>
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs text-silver-400 uppercase tracking-wide block mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-silver-200 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-silver-400 uppercase tracking-wide block mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-silver-200 px-3 py-2 text-sm"
              placeholder="Notas de seguimiento con este cliente..."
            />
          </div>
          <Button type="button" variant="primary" onClick={handleSave} disabled={saving} className="self-start">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
