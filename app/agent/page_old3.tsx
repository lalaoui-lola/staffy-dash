'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import LeadTableAgent from '@/components/LeadTableAgent'
import AddLeadModal from '@/components/AddLeadModal'
import EditLeadModal from '@/components/EditLeadModal'
import { Calendar, CheckCircle, Clock, Plus, TrendingUp, Search, Filter, X } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function AgentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({
    totalLeads: 0,
    valides: 0,
    nonValides: 0,
    rdvCeMois: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showAddLead, setShowAddLead] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDateRdv, setFilterDateRdv] = useState('')
  const [filterDateCreation, setFilterDateCreation] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [leads, searchTerm, filterDateRdv, filterDateCreation])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profileData || profileData.role !== 'agent') {
      router.push('/login')
      return
    }

    setUser(session.user)
    setProfile(profileData)
    loadLeads(session.user.id)
  }

  async function loadLeads(userId: string) {
    setLoading(true)

    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .eq('agent_id', userId)
      .order('created_at', { ascending: false })

    if (leadsData) {
      setLeads(leadsData)
      
      // Calculer les statistiques
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      const rdvCeMois = leadsData.filter(l => {
        if (!l.date_rdv) return false
        const rdvDate = new Date(l.date_rdv)
        return rdvDate.getMonth() === currentMonth && rdvDate.getFullYear() === currentYear
      }).length

      setStats({
        totalLeads: leadsData.length,
        valides: leadsData.filter(l => l.qualite === 'valide').length,
        nonValides: leadsData.filter(l => l.qualite === 'non_valide').length,
        rdvCeMois: rdvCeMois,
      })
    }

    setLoading(false)
  }

  function applyFilters() {
    let filtered = [...leads]

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.nom_societe.toLowerCase().includes(term) ||
        lead.nom_client.toLowerCase().includes(term) ||
        (lead.telephone && lead.telephone.includes(term)) ||
        (lead.mail && lead.mail.toLowerCase().includes(term)) ||
        (lead.numero_siret && lead.numero_siret.includes(term))
      )
    }

    // Filtre par date de RDV
    if (filterDateRdv) {
      filtered = filtered.filter(lead => lead.date_rdv === filterDateRdv)
    }

    // Filtre par date de création
    if (filterDateCreation) {
      filtered = filtered.filter(lead => {
        if (!lead.date_creation) return false
        const creationDate = new Date(lead.date_creation).toISOString().split('T')[0]
        return creationDate === filterDateCreation
      })
    }

    setFilteredLeads(filtered)
  }

  function clearFilters() {
    setSearchTerm('')
    setFilterDateRdv('')
    setFilterDateCreation('')
  }

  async function handleDeleteLead(leadId: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)

    if (!error && user) {
      loadLeads(user.id)
    }
  }

  const hasActiveFilters = searchTerm || filterDateRdv || filterDateCreation

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement de vos rendez-vous...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar userName={profile?.full_name || profile?.email} userRole="agent" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec animation */}
        <div className="mb-8 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mes Rendez-vous
              </h1>
              <p className="text-gray-600">Gérez vos rendez-vous clients et suivez vos performances</p>
            </div>
            <button
              onClick={() => setShowAddLead(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau RDV
            </button>
          </div>
        </div>

        {/* Stats Grid avec animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slideUp" style={{ animationDelay: '0ms' }}>
            <StatsCard
              title="Total RDV"
              value={stats.totalLeads}
              icon={Calendar}
              color="blue"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title="RDV ce mois"
              value={stats.rdvCeMois}
              icon={TrendingUp}
              color="purple"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title="Validés"
              value={stats.valides}
              icon={CheckCircle}
              color="green"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Non validés"
              value={stats.nonValides}
              icon={Clock}
              color="yellow"
            />
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fadeIn">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par société, client, téléphone, email, SIRET..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                hasActiveFilters
                  ? 'border-primary-600 text-primary-600 bg-primary-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[searchTerm, filterDateRdv, filterDateCreation].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Bouton effacer filtres */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all"
              >
                <X className="h-5 w-5 mr-2" />
                Effacer
              </button>
            )}
          </div>

          {/* Panel de filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
              {/* Filtre date RDV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date du RDV
                </label>
                <input
                  type="date"
                  value={filterDateRdv}
                  onChange={(e) => setFilterDateRdv(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Filtre date création */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Date de création
                </label>
                <input
                  type="date"
                  value={filterDateCreation}
                  onChange={(e) => setFilterDateCreation(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section titre avec compteur */}
        <div className="mb-6 animate-fadeIn flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Liste des Rendez-vous</h2>
            <p className="text-gray-600">
              {filteredLeads.length} rendez-vous {hasActiveFilters && `(${leads.length} au total)`}
            </p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <LeadTableAgent
            leads={filteredLeads}
            onEdit={(lead) => setEditingLead(lead)}
            onDelete={handleDeleteLead}
          />
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Conseils pour optimiser vos rendez-vous
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Utilisez la recherche pour retrouver rapidement un client</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Filtrez par date de RDV pour voir votre planning</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Ajoutez des commentaires détaillés après chaque rendez-vous</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Les RDV "Non validés" attendent la validation qualité</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Modal d'ajout de lead */}
      {showAddLead && profile && (
        <AddLeadModal
          onClose={() => setShowAddLead(false)}
          onLeadAdded={() => {
            if (user) loadLeads(user.id)
            setShowAddLead(false)
          }}
          agentId={profile.id}
          agentName={profile.full_name || profile.email}
        />
      )}

      {/* Modal de modification de lead */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onLeadUpdated={() => {
            if (user) loadLeads(user.id)
            setEditingLead(null)
          }}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
