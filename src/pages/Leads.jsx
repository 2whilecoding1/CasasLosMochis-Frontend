import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import leadService from '../services/leadService'
import useAuthStore from '../stores/authStore'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

const COLUMNS = [
  { key: 'new', label: 'Nuevo' },
  { key: 'contacted', label: 'Contactado' },
  { key: 'interested', label: 'Interesado' },
  { key: 'negotiating', label: 'Negociando' },
  { key: 'closed', label: 'Cerrado' },
  { key: 'lost', label: 'Perdido' },
]

function formatBudget(min, max) {
  const fmt = (v) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `Desde ${fmt(min)}`
  if (max) return `Hasta ${fmt(max)}`
  return null
}

function LeadCard({ lead, currentUserId, onStatusChange, onAssignToMe, busy }) {
  const isUnassigned = !lead.agent_name
  const budget = formatBudget(lead.budget_min, lead.budget_max)

  return (
    <Card className="p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/leads/${lead.id}`} className="font-semibold text-[#1a1a1a] text-sm hover:text-gold-600 transition-colors">
          {lead.first_name} {lead.last_name}
        </Link>
      </div>
      <p className="text-xs text-silver-500">{lead.email}</p>
      <p className="text-xs text-silver-500">{lead.phone}</p>
      {budget && <p className="text-xs text-silver-600 font-medium">{budget}</p>}
      <p className="text-[11px] text-silver-400">
        {isUnassigned ? 'Sin asignar' : `Agente: ${lead.agent_name}`}
      </p>

      <div className="flex flex-col gap-1.5 pt-1 border-t border-silver-100 mt-1">
        <select
          value={lead.status}
          disabled={busy}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
          className="text-xs rounded-lg border border-silver-200 px-2 py-1.5 bg-white disabled:opacity-50"
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        {isUnassigned && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onAssignToMe(lead.id)}
            className="text-xs"
          >
            Asignarme
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function Leads() {
  const { user } = useAuthStore()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await leadService.getLeads()
      const items = Array.isArray(payload) ? payload : payload?.results || []
      setLeads(items)
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudieron cargar los leads.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id, status) => {
    setBusyId(id)
    const previous = leads
    setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, status } : l)))
    try {
      await leadService.patchLead(id, { status })
      toast.success('Estado actualizado.')
    } catch (err) {
      setLeads(previous)
      toast.error(getFriendlyMessage(err, 'No se pudo actualizar el estado del lead.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleAssignToMe = async (id) => {
    setBusyId(id)
    try {
      const updated = await leadService.assignToMe(id)
      setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, agent_name: updated.agent_name } : l)))
      toast.success('Lead asignado a ti.')
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo asignar el lead.'))
    } finally {
      setBusyId(null)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return leads
    const q = search.toLowerCase()
    return leads.filter((l) =>
      `${l.first_name} ${l.last_name} ${l.email} ${l.phone}`.toLowerCase().includes(q)
    )
  }, [leads, search])

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]))
    filtered.forEach((l) => {
      if (map[l.status]) map[l.status].push(l)
    })
    return map
  }, [filtered])

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl">
              Mis Leads
            </h1>
            <p className="text-silver-500 text-sm mt-1">
              {user?.is_staff || user?.role === 'admin'
                ? 'Viendo todos los leads (admin).'
                : 'Viendo los leads asignados a ti.'}
            </p>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-silver-200 px-3 py-2 text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-silver-400">
            <p className="text-base font-medium">Cargando leads...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-[#1a1a1a]">{col.label}</h2>
                  <span className="text-xs text-silver-400 bg-silver-100 rounded-full px-2 py-0.5">
                    {byStatus[col.key]?.length ?? 0}
                  </span>
                </div>
                <div className="flex flex-col gap-3 min-h-[80px]">
                  {(byStatus[col.key] ?? []).map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      currentUserId={user?.id}
                      onStatusChange={handleStatusChange}
                      onAssignToMe={handleAssignToMe}
                      busy={busyId === lead.id}
                    />
                  ))}
                  {(byStatus[col.key] ?? []).length === 0 && (
                    <p className="text-xs text-silver-300 text-center py-4">Sin leads</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
