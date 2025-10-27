'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import AdminSidebar from '@/components/AdminSidebar'
import StatsChart from '@/components/StatsChart'
import WeeklyChart from '@/components/WeeklyChart'
import AgentRanking from '@/components/AgentRanking'
import CalendarView from '@/components/CalendarView'
import AllLeadsTable from '@/components/AllLeadsTable'
import UsersManagement from '@/components/UsersManagement'
import { Users, TrendingUp, CheckCircle, XCircle, Search, Filter, X, Calendar, Clock, User as UserIcon, CalendarClock, CalendarDays, Target, BarChart3, Plus } from 'lucide-react'
import AddUserModal from '@/components/AddUserModal'
import AddLeadModal from '@/components/AddLeadModal'
import EditLeadModal from '@/components/EditLeadModal'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type LeadWithAgent = Lead & { agent?: Profile | null; conseiller?: Profile | null }

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leads, setLeads] = useState<LeadWithAgent[]>([])
  const [filteredLeads, setFilteredLeads] = useState<LeadWithAgent[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [agents, setAgents] = useState<Profile[]>([])
  const [stats, setStats] = useState({
    totalLeads: 0,
    valides: 0,
    nonValides: 0,
    agents: 0,
    rdvOk: 0,
    rdvAujourdhui: 0,
    rdvCetteSemaine: 0,
    rdvCeMois: 0,
  })
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([])
  const [agentStats, setAgentStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'unvalidated' | 'no-feedback' | 'calendar' | 'users'>('dashboard')
  const [showAddLead, setShowAddLead] = useState(false)
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDateRdvDebut, setFilterDateRdvDebut] = useState('')
  const [filterDateRdvFin, setFilterDateRdvFin] = useState('')
  const [filterDateCreationDebut, setFilterDateCreationDebut] = useState('')
  const [filterDateCreationFin, setFilterDateCreationFin] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [filterStatutConseiller, setFilterStatutConseiller] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

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

    const typedProfile = profileData as Profile | null

    if (!typedProfile || typedProfile.role !== 'administrateur') {
      router.push('/login')
      return
    }

    setUser(session.user)
    setProfile(typedProfile)
    loadData()
  }

  async function loadData() {
    console.log('🔄 loadData() appelée')
    setLoading(true)

    // Charger tous les leads avec les infos des agents et conseillers
    const { data: leadsData, error } = await supabase
      .from('leads')
      .select(`
        *,
        agent:agent_id(id, email, full_name, role),
        conseiller:conseiller_suivi_id(id, email, full_name, role)
      `)
      .order('created_at', { ascending: false })

    console.log('📦 Supabase retourne:', { 
      nbLeads: leadsData?.length || 0, 
      error: error?.message,
      premiersLeads: leadsData?.slice(0, 2).map((l: any) => l.nom_societe)
    })

    let typedLeadsData: LeadWithAgent[] = []
    
    if (leadsData) {
      typedLeadsData = leadsData as LeadWithAgent[]
      setLeads(typedLeadsData)
      
      // Calculer les statistiques avec la date locale du PC
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      // Utiliser la date locale au lieu de UTC
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`
      
      // Calculer le début de la semaine (lundi de cette semaine) en utilisant la date locale
      const currentDay = now.getDay() // 0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi
      
      // Calculer combien de jours en arrière pour arriver au lundi
      let daysToMonday = (currentDay + 6) % 7 // Formule correcte : (jour + 6) % 7
      
      const monday = new Date(now)
      monday.setDate(now.getDate() - daysToMonday)
      monday.setHours(0, 0, 0, 0)
      
      const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
      
      // Calculer vendredi (4 jours après lundi)
      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4)
      const fridayStr = `${friday.getFullYear()}-${String(friday.getMonth() + 1).padStart(2, '0')}-${String(friday.getDate()).padStart(2, '0')}`
      
      // Vérifier combien de leads ont une date de création
      const leadsWithCreatedAt = typedLeadsData.filter(l => l.created_at)
      
      // Compter les RDV par agent
      const rdvParAgent = typedLeadsData.reduce((acc: any, lead) => {
        const agentId = lead.agent_id || 'sans_agent'
        acc[agentId] = (acc[agentId] || 0) + 1
        return acc
      }, {})
      
      console.log('📊 ADMIN - Analyse des leads:', {
        totalLeads: typedLeadsData.length,
        leadsAvecCreatedAt: leadsWithCreatedAt.length,
        leadsSansCreatedAt: typedLeadsData.length - leadsWithCreatedAt.length,
        rdvParAgent: rdvParAgent
      })
      
      console.log('📅 Semaine actuelle (Lundi-Vendredi):', {
        aujourdHui: today,
        jourSemaine: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][currentDay],
        lundi: mondayStr,
        vendredi: fridayStr,
        totalLeads: typedLeadsData.length
      })
      
      // Afficher quelques exemples de dates de création
      console.log('📋 Exemples de dates de création:', 
        typedLeadsData.slice(0, 5).map(l => ({
          societe: l.nom_societe,
          created_at: l.created_at,
          agent_id: l.agent_id
        }))
      )
      
      const rdvCeMois = typedLeadsData.filter(l => {
        if (!l.date_rdv) return false
        const rdvDate = new Date(l.date_rdv)
        return rdvDate.getMonth() === currentMonth && rdvDate.getFullYear() === currentYear
      }).length

      const rdvAujourdhui = typedLeadsData.filter(l => {
        if (!l.created_at) return false
        const createdStr = l.created_at.split('T')[0]
        return createdStr === today
      }).length

      const rdvCetteSemaine = typedLeadsData.filter(l => {
        if (!l.created_at) return false
        const createdStr = l.created_at.split('T')[0]
        return createdStr >= mondayStr && createdStr <= fridayStr
      }).length

      // Données pour le graphique hebdomadaire (basé sur created_at - date de création)
      const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
      const weekData = daysOfWeek.map((day, index) => {
        const dayDate = new Date(monday)
        dayDate.setDate(monday.getDate() + index)
        const dayString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`
        
        const count = typedLeadsData.filter(l => {
          if (!l.created_at) return false
          // Extraire juste la date (YYYY-MM-DD) de created_at qui est au format ISO
          const createdStr = l.created_at.split('T')[0]
          return createdStr === dayString
        }).length
        
        console.log(`📅 ${day} (${dayString}): ${count} RDV créés`)
        
        return { day, count }
      })
      
      console.log('📊 Données hebdomadaires (RDV créés):', weekData)
      console.log('🔄 Mise à jour de weeklyData avec:', weekData)

      setWeeklyData(weekData)
      
      setStats({
        totalLeads: typedLeadsData.length,
        valides: typedLeadsData.filter(l => l.qualite === 'valide').length,
        nonValides: typedLeadsData.filter(l => l.qualite === 'non_valide').length,
        agents: new Set(typedLeadsData.map(l => l.agent_id).filter(Boolean)).size,
        rdvOk: typedLeadsData.filter(l => l.statut_conseiller === 'ok').length,
        rdvAujourdhui: rdvAujourdhui,
        rdvCetteSemaine: rdvCetteSemaine,
        rdvCeMois: rdvCeMois,
      })
    }

    // Charger tous les utilisateurs
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersData) {
      const typedUsersData = usersData as Profile[]
      setUsers(typedUsersData)
      const agentsList = typedUsersData.filter(u => u.role === 'agent')
      setAgents(agentsList)
      
      // Calculer les stats par agent
      if (typedLeadsData) {
        const agentsWithStats = agentsList.map(agent => {
          const agentLeads = typedLeadsData.filter(l => l.agent_id === agent.id)
          const valides = agentLeads.filter(l => l.qualite === 'valide').length
          const rdvOk = agentLeads.filter(l => l.statut_conseiller === 'ok').length
          const performance = valides > 0 ? Math.round((rdvOk / valides) * 100) : 0
          
          return {
            id: agent.id,
            name: agent.full_name || '',
            email: agent.email,
            totalRdv: agentLeads.length,
            rdvValides: valides,
            rdvOk: rdvOk,
            performance: performance
          }
        })
        
        setAgentStats(agentsWithStats)
      }
    }

    setLoading(false)
  }

  // Appliquer les filtres
  useEffect(() => {
    applyFilters()
  }, [leads, searchTerm, filterDateRdvDebut, filterDateRdvFin, filterDateCreationDebut, filterDateCreationFin, filterAgent, filterStatutConseiller])

  // Recalculer les stats quand le filtre agent change
  useEffect(() => {
    if (leads.length > 0) {
      console.log('🔄 useEffect filterAgent appelé, filterAgent=', filterAgent)
      const filteredData = filterAgent 
        ? leads.filter(l => l.agent_id === filterAgent)
        : leads

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      // Utiliser la date locale
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`
      
      // Calculer le lundi correctement
      const currentDay = now.getDay()
      let daysToMonday = (currentDay + 6) % 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - daysToMonday)
      monday.setHours(0, 0, 0, 0)
      
      const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
      
      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4)
      const fridayStr = `${friday.getFullYear()}-${String(friday.getMonth() + 1).padStart(2, '0')}-${String(friday.getDate()).padStart(2, '0')}`

      const rdvCeMois = filteredData.filter(l => {
        if (!l.date_rdv) return false
        const rdvDate = new Date(l.date_rdv)
        return rdvDate.getMonth() === currentMonth && rdvDate.getFullYear() === currentYear
      }).length

      const rdvAujourdhui = filteredData.filter(l => {
        if (!l.created_at) return false
        const createdStr = l.created_at.split('T')[0]
        return createdStr === today
      }).length

      const rdvCetteSemaine = filteredData.filter(l => {
        if (!l.created_at) return false
        const createdStr = l.created_at.split('T')[0]
        return createdStr >= mondayStr && createdStr <= fridayStr
      }).length

      const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
      const weekData = daysOfWeek.map((day, index) => {
        const dayDate = new Date(monday)
        dayDate.setDate(monday.getDate() + index)
        const dayString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`
        
        const count = filteredData.filter(l => {
          if (!l.created_at) return false
          const createdStr = l.created_at.split('T')[0]
          return createdStr === dayString
        }).length
        
        return { day, count }
      })

      console.log('🔄 useEffect met à jour weeklyData:', weekData.reduce((sum, d) => sum + d.count, 0), 'RDV')
      setWeeklyData(weekData)

      setStats({
        totalLeads: filteredData.length,
        valides: filteredData.filter(l => l.qualite === 'valide').length,
        nonValides: filteredData.filter(l => l.qualite === 'non_valide').length,
        agents: filterAgent ? 1 : new Set(leads.map(l => l.agent_id).filter(Boolean)).size,
        rdvOk: filteredData.filter(l => l.statut_conseiller === 'ok').length,
        rdvAujourdhui: rdvAujourdhui,
        rdvCetteSemaine: rdvCetteSemaine,
        rdvCeMois: rdvCeMois,
      })
    }
  }, [filterAgent, leads])

  function applyFilters() {
    let filtered = [...leads]

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.nom_societe?.toLowerCase().includes(term) ||
          lead.nom_client?.toLowerCase().includes(term) ||
          lead.telephone?.toLowerCase().includes(term) ||
          lead.mail?.toLowerCase().includes(term) ||
          lead.numero_siret?.toLowerCase().includes(term)
      )
    }

    // Filtre par plage de dates RDV
    if (filterDateRdvDebut) {
      filtered = filtered.filter((lead) => lead.date_rdv && lead.date_rdv >= filterDateRdvDebut)
    }
    if (filterDateRdvFin) {
      filtered = filtered.filter((lead) => lead.date_rdv && lead.date_rdv <= filterDateRdvFin)
    }

    // Filtre par plage de dates création
    if (filterDateCreationDebut) {
      filtered = filtered.filter((lead) => {
        const creationDate = new Date(lead.date_creation).toISOString().split('T')[0]
        return creationDate >= filterDateCreationDebut
      })
    }
    if (filterDateCreationFin) {
      filtered = filtered.filter((lead) => {
        const creationDate = new Date(lead.date_creation).toISOString().split('T')[0]
        return creationDate <= filterDateCreationFin
      })
    }

    // Filtre par agent
    if (filterAgent) {
      filtered = filtered.filter((lead) => lead.agent_id === filterAgent)
    }

    // Filtre par statut conseiller
    if (filterStatutConseiller) {
      filtered = filtered.filter((lead) => lead.statut_conseiller === filterStatutConseiller)
    }

    setFilteredLeads(filtered)
  }

  function clearFilters() {
    setSearchTerm('')
    setFilterDateRdvDebut('')
    setFilterDateRdvFin('')
    setFilterDateCreationDebut('')
    setFilterDateCreationFin('')
    setFilterAgent('')
    setFilterStatutConseiller('')
  }

  async function handleDeleteLead(leadId: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)

    if (!error) {
      loadData()
    }
  }

  async function handleValidateLead(leadId: string, newStatus: 'valide' | 'non_valide') {
    const { error } = await supabase
      .from('leads')
      // @ts-expect-error - Supabase type inference issue with update
      .update({ qualite: newStatus })
      .eq('id', leadId)

    if (!error) {
      loadData()
    }
  }

  const hasActiveFilters = searchTerm || filterDateRdvDebut || filterDateRdvFin || filterDateCreationDebut || filterDateCreationFin || filterAgent || filterStatutConseiller
  
  // Filtrer les leads non validés
  const unvalidatedLeads = leads.filter(lead => lead.qualite === 'non_valide')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#EEF2F2] via-[#F7C7BB]/30 to-[#EEF2F2]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#175C64]/20 border-t-indigo-600 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-8 w-8 bg-[#175C64] rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-bold text-gray-700 animate-pulse">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F2] via-[#F7C7BB]/30 to-[#EEF2F2]">
      <Navbar userName={profile?.full_name || profile?.email} userRole="administrateur" />
      
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddUser={() => setShowAddUser(true)}
      />
      
      <main className="ml-72 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500">
        {/* Hero Header Ultra Moderne */}
        <div className="mb-10 animate-fadeInDown">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#0E3A40] rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#175C64] to-[#0E3A40] p-4 rounded-2xl shadow-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40] mb-1">
                {activeTab === 'dashboard' ? 'Tableau de Bord' :
                 activeTab === 'leads' ? 'Tous les Leads' : 
                 activeTab === 'unvalidated' ? 'Leads Non Validés' :
                 activeTab === 'no-feedback' ? 'RDV sans Retour' :
                 activeTab === 'calendar' ? 'Calendrier' :
                 'Gestion des Utilisateurs'}
              </h1>
              <p className="text-gray-600 font-medium">
                {activeTab === 'dashboard' ? '📊 Vue d\'ensemble des performances' :
                 activeTab === 'leads' ? '✨ Vue complète de tous les rendez-vous' : 
                 activeTab === 'unvalidated' ? '⚠️ Leads en attente de validation' :
                 activeTab === 'no-feedback' ? '📋 RDV en attente de retour conseiller' :
                 activeTab === 'calendar' ? '📅 Calendrier des rendez-vous' :
                 '👥 Gérez vos utilisateurs'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'dashboard' ? (
          /* PAGE DASHBOARD */
          <>
            {/* Filtre Agent */}
            <div className="mb-6 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-4">
                <UserIcon className="h-6 w-6 text-[#175C64]" />
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Filtrer par Agent
                  </label>
                  <select
                    value={filterAgent}
                    onChange={(e) => setFilterAgent(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300"
                  >
                    <option value="">Tous les agents</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name || agent.email}
                      </option>
                    ))}
                  </select>
                </div>
                {filterAgent && (
                  <button
                    onClick={() => setFilterAgent('')}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid - Ligne 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                  title="RDV Validés"
                  value={stats.valides}
                  icon={CheckCircle}
                  color="green"
                />
              </div>
              <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
                <StatsCard
                  title="RDV OK (Conseiller)"
                  value={stats.rdvOk}
                  icon={Target}
                  color="purple"
                />
              </div>
              <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
                <StatsCard
                  title="Nombre d'Agents"
                  value={stats.agents}
                  icon={Users}
                  color="indigo"
                />
              </div>
            </div>

            {/* Stats Grid - Ligne 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
                <StatsCard
                  title="RDV Aujourd'hui"
                  value={stats.rdvAujourdhui}
                  icon={CalendarClock}
                  color="orange"
                />
              </div>
              <div className="animate-slideUp" style={{ animationDelay: '500ms' }}>
                <StatsCard
                  title="RDV Cette Semaine"
                  value={stats.rdvCetteSemaine}
                  icon={CalendarDays}
                  color="teal"
                />
              </div>
              <div className="animate-slideUp" style={{ animationDelay: '600ms' }}>
                <StatsCard
                  title="RDV ce mois"
                  value={stats.rdvCeMois}
                  icon={TrendingUp}
                  color="indigo"
                />
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn">
              <div className="lg:col-span-2">
                <StatsChart
                  totalRdv={stats.totalLeads}
                  rdvValides={stats.valides}
                  rdvOk={stats.rdvOk}
                />
              </div>
              <div>
                {!loading && weeklyData.length > 0 ? (
                  <WeeklyChart 
                    key={`weekly-${JSON.stringify(weeklyData)}`}
                    data={weeklyData} 
                  />
                ) : (
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">📅 RDV Créés Cette Semaine</h3>
                    <div className="text-center py-8 text-gray-500">
                      {loading ? 'Chargement...' : 'Aucune donnée disponible'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Classements des Agents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fadeIn">
              <AgentRanking agents={agentStats} type="rdv" />
              <AgentRanking agents={agentStats} type="performance" />
            </div>

            {/* Taux de conversion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Taux de Validation</h3>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  {stats.totalLeads > 0 ? Math.round((stats.valides / stats.totalLeads) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.valides} / {stats.totalLeads} RDV validés
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Taux OK</h3>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#F7C7BB]">
                  {stats.totalLeads > 0 ? Math.round((stats.rdvOk / stats.totalLeads) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.rdvOk} / {stats.totalLeads} RDV OK
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                  <TrendingUp className="h-8 w-8 text-indigo-500" />
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40]">
                  {stats.valides > 0 ? Math.round((stats.rdvOk / stats.valides) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  OK sur validés
                </p>
              </div>
            </div>
          </>
        ) : activeTab === 'users' ? (
          /* Page Utilisateurs */
          <UsersManagement users={users} onUserUpdated={loadData} />
        ) : activeTab === 'unvalidated' ? (
          /* Page Leads Non Validés */
          <>
            {/* Stats pour leads non validés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="animate-slideUp">
                <StatsCard
                  title="Leads non validés"
                  value={stats.nonValides}
                  icon={XCircle}
                  color="yellow"
                />
              </div>
              <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
                <StatsCard
                  title="Total Leads"
                  value={stats.totalLeads}
                  icon={Users}
                  color="indigo"
                />
              </div>
            </div>

            {/* Section titre */}
            <div className="mb-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Leads en attente de validation</h2>
              <p className="text-gray-600">
                {unvalidatedLeads.length} lead(s) à valider
              </p>
            </div>

            {/* Table des leads non validés */}
            <div className="animate-fadeIn">
              <AllLeadsTable
                leads={unvalidatedLeads}
                onEdit={(lead) => setEditingLead(lead)}
                onDelete={handleDeleteLead}
                onValidate={handleValidateLead}
                showValidateButton={true}
              />
            </div>
          </>
        ) : activeTab === 'leads' ? (
          /* Page Tous les Leads */
          <>
            {/* Bouton Ajouter Lead */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddLead(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#175C64] to-[#0E3A40] text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#F7C7BB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Ajouter un Lead
                </div>
              </button>
            </div>

            {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slideUp" style={{ animationDelay: '0ms' }}>
            <StatsCard
              title="Total Leads"
              value={stats.totalLeads}
              icon={Users}
              color="indigo"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title="Validés"
              value={stats.valides}
              icon={CheckCircle}
              color="green"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title="Non validés"
              value={stats.nonValides}
              icon={XCircle}
              color="yellow"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Agents actifs"
              value={stats.agents}
              icon={UserIcon}
              color="purple"
            />
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 animate-fadeIn">
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/30">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#175C64] transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Rechercher par société, client, téléphone, email, SIRET..."
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    hasActiveFilters
                      ? 'bg-gradient-to-r from-[#175C64] to-[#0E3A40] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtres
                    {hasActiveFilters && (
                      <span className="ml-2 bg-white text-[#175C64] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                        {[searchTerm, filterDateRdvDebut, filterDateRdvFin, filterDateCreationDebut, filterDateCreationFin, filterAgent, filterStatutConseiller].filter(Boolean).length}
                      </span>
                    )}
                  </div>
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-4 bg-gradient-to-r from-red-500 to-accent-500 text-white rounded-2xl font-bold hover:from-red-600 hover:to-accent-600 transition-all duration-300 transform hover:scale-105 shadow-lg animate-fadeIn"
                  >
                    <div className="flex items-center">
                      <X className="h-5 w-5 mr-2" />
                      Effacer
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Panel de filtres */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-slideDown">
                {/* Ligne 1: Plage de dates RDV */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#175C64]" />
                      Date RDV - Début
                    </label>
                    <input
                      type="date"
                      value={filterDateRdvDebut}
                      onChange={(e) => setFilterDateRdvDebut(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#175C64]" />
                      Date RDV - Fin
                    </label>
                    <input
                      type="date"
                      value={filterDateRdvFin}
                      onChange={(e) => setFilterDateRdvFin(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Ligne 2: Plage de dates création */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-[#175C64]" />
                      Date Création - Début
                    </label>
                    <input
                      type="date"
                      value={filterDateCreationDebut}
                      onChange={(e) => setFilterDateCreationDebut(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#0E3A40] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-[#175C64]" />
                      Date Création - Fin
                    </label>
                    <input
                      type="date"
                      value={filterDateCreationFin}
                      onChange={(e) => setFilterDateCreationFin(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#0E3A40] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Ligne 3: Agent et Statut Conseiller */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-pink-600" />
                      Agent
                    </label>
                    <select
                      value={filterAgent}
                      onChange={(e) => setFilterAgent(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300"
                    >
                      <option value="">Tous les agents</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name || agent.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Réponse Conseiller
                    </label>
                    <select
                      value={filterStatutConseiller}
                      onChange={(e) => setFilterStatutConseiller(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="ok">✅ OK</option>
                      <option value="nok">❌ NOK</option>
                      <option value="rappeler">📞 Rappeler</option>
                      <option value="en_attente">⏳ En attente</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section titre avec compteur */}
        <div className="mb-6 animate-fadeIn flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Liste des Leads</h2>
            <p className="text-gray-600">
              {filteredLeads.length} lead(s) {hasActiveFilters && `(${leads.length} au total)`}
            </p>
          </div>
        </div>

        {/* Leads Table */}
            <div className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <AllLeadsTable
                leads={filteredLeads}
                onEdit={(lead) => setEditingLead(lead)}
                onDelete={handleDeleteLead}
                onValidate={handleValidateLead}
                showValidateButton={true}
              />
            </div>
          </>
        ) : activeTab === 'no-feedback' ? (
          /* Page RDV sans retour conseiller */
          <>
            <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
              <p className="text-rose-900 font-bold">📋 RDV en attente de retour conseiller</p>
              <p className="text-rose-700 text-sm mt-1">Ces leads validés n'ont pas encore reçu de retour du conseiller</p>
            </div>

            <div className="animate-fadeIn">
              <AllLeadsTable
                leads={leads.filter(l => l.qualite === 'valide' && l.statut_conseiller === 'en_attente')}
                onEdit={(lead) => setEditingLead(lead)}
                onDelete={handleDeleteLead}
                onValidate={handleValidateLead}
                showValidateButton={false}
              />
            </div>
          </>
        ) : activeTab === 'calendar' ? (
          /* Page Calendrier */
          <>
            <div className="mb-6 bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
              <p className="text-teal-900 font-bold">📅 Calendrier des RDV</p>
              <p className="text-teal-700 text-sm mt-1">Vue calendrier de tous les rendez-vous planifiés</p>
            </div>

            {/* Calendrier */}
            <CalendarView
              leads={leads}
              onLeadClick={(lead) => setEditingLead(lead)}
            />
          </>
        ) : null}
      </main>

      {/* Modal d'ajout d'utilisateur */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => {
            loadData()
            setShowAddUser(false)
          }}
        />
      )}

      {/* Modal d'édition de lead */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onLeadUpdated={() => {
            loadData()
            setEditingLead(null)
          }}
        />
      )}

      {/* Modal d'ajout de lead */}
      {showAddLead && profile && (
        <AddLeadModal
          onClose={() => setShowAddLead(false)}
          onLeadAdded={() => {
            loadData()
            setShowAddLead(false)
          }}
          agentId={profile.id}
          agentName={profile.full_name || profile.email}
        />
      )}
    </div>
  )
}
