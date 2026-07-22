// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Common/Card'
import leadService from '../services/leadService'
import contractService from '../services/contractService'
import useAuthStore from '../stores/authStore'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

const STATUS_LABELS = {
  new: 'Nuevo', contacted: 'Contactado', interested: 'Interesado',
  negotiating: 'Negociando', closed: 'Cerrado', lost: 'Perdido',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [leadCounts, setLeadCounts] = useState(null)
  const [contractCount, setContractCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [leadsPayload, contractsPayload] = await Promise.all([
          leadService.getLeads(),
          contractService.getContracts(),
        ])
        if (!mounted) return
        const leads = Array.isArray(leadsPayload) ? leadsPayload : leadsPayload?.results || []
        const contracts = Array.isArray(contractsPayload) ? contractsPayload : contractsPayload?.results || []
        const counts = {}
        leads.forEach((lead) => {
          counts[lead.status] = (counts[lead.status] || 0) + 1
        })
        setLeadCounts(counts)
        setContractCount(contracts.length)
      } catch (err) {
        if (mounted) toast.error(getFriendlyMessage(err, 'No se pudo cargar el resumen.'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const totalLeads = leadCounts ? Object.values(leadCounts).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl mb-1">
          Hola, {user?.first_name || user?.username}
        </h1>
        <p className="text-silver-500 text-sm mb-6">Este es el resumen de tu actividad.</p>

        {loading ? (
          <p className="text-silver-400 text-center py-10">Cargando resumen...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <p className="text-xs text-silver-400 uppercase tracking-wide">Leads totales</p>
                <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{totalLeads}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-silver-400 uppercase tracking-wide">Contratos</p>
                <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{contractCount ?? 0}</p>
              </Card>
              {Object.entries(leadCounts || {}).map(([status, count]) => (
                <Card key={status} className="p-4">
                  <p className="text-xs text-silver-400 uppercase tracking-wide">{STATUS_LABELS[status] ?? status}</p>
                  <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{count}</p>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/leads" className="text-sm font-semibold text-gold-600 hover:text-gold-700 underline underline-offset-2">
                Ver mis leads →
              </Link>
              <Link to="/contracts" className="text-sm font-semibold text-gold-600 hover:text-gold-700 underline underline-offset-2">
                Ver contratos →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
