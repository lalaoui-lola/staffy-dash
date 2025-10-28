'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import AgentSidebar from '@/components/AgentSidebar'
import StatsChart from '@/components/StatsChart'
import WeeklyChart from '@/components/WeeklyChart'
import LeadTableAgent from '@/components/LeadTableAgent'
import AddLeadModal from '@/components/AddLeadModal'
import EditLeadModal from '@/components/EditLeadModal'
import { Calendar, CheckCircle, Clock, Plus, TrendingUp, Search, Filter, X, BarChart3, Target, CalendarDays, CalendarClock } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type LeadWithConseiller = Lead & { conseiller?: Profile | null }

export default function AgentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leads, setLeads] = useState<LeadWithConseiller[]>([])
  const [filteredLeads, setFilteredLeads] = useState<LeadWithConseiller[]>([])
  const [stats, setStats] = useState({
    totalLeads: 0,
    valides: 0,
    nonValides: 0,
    rdvCeMois: 0,
    rdvOk: 0,
    rdvAujourdhui: 0,
    rdvCetteSemaine: 0,
  })
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads'>('dashboard')
  const [showAddLead, setShowAddLead] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDateRdvDebut, setFilterDateRdvDebut] = useState('')
  const [filterDateRdvFin, setFilterDateRdvFin] = useState('')
  const [filterDateCreationDebut, setFilterDateCreationDebut] = useState('')
  const [filterDateCreationFin, setFilterDateCreationFin] = useState('')
  const [filterQualite, setFilterQualite] = useState('')
  const [filterStatutConseiller, setFilterStatutConseiller] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [leads, searchTerm, filterDateRdvDebut, filterDateRdvFin, filterDateCreationDebut, filterDateCreationFin, filterQualite, filterStatutConseiller])

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

    if (!typedProfile || typedProfile.role !== 'agent') {
      router.push('/login')
      return
    }

    setUser(session.user)
    setProfile(typedProfile)
    loadLeads(session.user.id)
  }

  async function loadLeads(userId: string) {
    setLoading(true)

    const { data: leadsData } = await supabase
      .from('leads')
      .select(`
        *,
        conseiller:conseiller_suivi_id(id, email, full_name, role)
      `)
      .eq('agent_id', userId)
      .order('created_at', { ascending: false })

    if (leadsData) {
      const typedLeadsData = leadsData as LeadWithConseiller[]
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
      
      console.log('📅 Semaine actuelle (Lundi-Vendredi):', {
        aujourdHui: today,
        jourSemaine: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][currentDay],
        lundi: mondayStr,
        vendredi: fridayStr,
        totalLeads: typedLeadsData.length
      })
      
      const rdvCeMois = typedLeadsData.filter(l => {
        if (!l.date_rdv) return false
        const rdvDate = new Date(l.date_rdv)
        return rdvDate.getMonth() === currentMonth && rdvDate.getFullYear() === currentYear
      }).length

      // RDV créés aujourd'hui
      const rdvAujourdhui = typedLeadsData.filter(l => {
        if (!l.created_at) return false
        const createdStr = l.created_at.split('T')[0]
        return createdStr === today
      }).length

      // RDV créés cette semaine (lundi à vendredi)
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
      
      console.log('📊 Données hebdomadaires agent (RDV créés):', weekData)

      setWeeklyData(weekData)

      setStats({
        totalLeads: typedLeadsData.length,
        valides: typedLeadsData.filter(l => l.qualite === 'valide').length,
        nonValides: typedLeadsData.filter(l => l.qualite === 'non_valide').length,
        rdvCeMois: rdvCeMois,
        rdvOk: typedLeadsData.filter(l => l.statut_conseiller === 'ok').length,
        rdvAujourdhui: rdvAujourdhui,
        rdvCetteSemaine: rdvCetteSemaine,
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

    // Filtre par plage de dates RDV
    if (filterDateRdvDebut) {
      filtered = filtered.filter(lead => lead.date_rdv && lead.date_rdv >= filterDateRdvDebut)
    }
    if (filterDateRdvFin) {
      filtered = filtered.filter(lead => lead.date_rdv && lead.date_rdv <= filterDateRdvFin)
    }

    // Filtre par plage de dates création
    if (filterDateCreationDebut) {
      filtered = filtered.filter(lead => {
        if (!lead.date_creation) return false
        const creationDate = new Date(lead.date_creation).toISOString().split('T')[0]
        return creationDate >= filterDateCreationDebut
      })
    }
    if (filterDateCreationFin) {
      filtered = filtered.filter(lead => {
        if (!lead.date_creation) return false
        const creationDate = new Date(lead.date_creation).toISOString().split('T')[0]
        return creationDate <= filterDateCreationFin
      })
    }

    // Filtre par qualité
    if (filterQualite) {
      filtered = filtered.filter(lead => lead.qualite === filterQualite)
    }

    // Filtre par statut conseiller
    if (filterStatutConseiller) {
      filtered = filtered.filter(lead => lead.statut_conseiller === filterStatutConseiller)
    }

    setFilteredLeads(filtered)
  }

  function clearFilters() {
    setSearchTerm('')
    setFilterDateRdvDebut('')
    setFilterDateRdvFin('')
    setFilterDateCreationDebut('')
    setFilterDateCreationFin('')
    setFilterQualite('')
    setFilterStatutConseiller('')
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

  const hasActiveFilters = searchTerm || filterDateRdvDebut || filterDateRdvFin || filterDateCreationDebut || filterDateCreationFin || filterQualite || filterStatutConseiller

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
          <p className="mt-6 text-lg font-bold text-gray-700 animate-pulse">Chargement de vos rendez-vous...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F2] via-[#F7C7BB]/30 to-[#EEF2F2]">
      <Navbar userName={profile?.full_name || profile?.email} userRole="agent" />
      
      {/* Sidebar */}
      <AgentSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddLead={() => setShowAddLead(true)}
      />
      
      <main className="ml-72 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500">
        {/* Hero Header Ultra Moderne */}
        <div className="mb-10 animate-fadeInDown">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#0E3A40] rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#175C64] to-[#0E3A40] p-4 rounded-2xl shadow-xl">
                {activeTab === 'dashboard' ? (
                  <BarChart3 className="h-8 w-8 text-white" />
                ) : (
                  <Calendar className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40] mb-1">
                {activeTab === 'dashboard' ? 'Tableau de Bord' : 'Mes Leads'}
              </h1>
              <p className="text-gray-600 font-medium">
                {activeTab === 'dashboard' ? '📊 Vue d\'ensemble de vos performances' : '✨ Gérez vos RDV avec efficacité'}
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          /* PAGE DASHBOARD */
          <>
            {/* Stats Grid avec animations - Ligne 1 */}
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
                  title="RDV ce mois"
                  value={stats.rdvCeMois}
                  icon={TrendingUp}
                  color="indigo"
                />
              </div>
            </div>

            {/* Stats Grid - Ligne 2 (Nouvelles stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    key={weeklyData.reduce((sum, d) => sum + d.count, 0)} 
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
        ) : (
          /* PAGE LEADS */
          <>
            {/* Stats Grid */}
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

            {/* Barre de recherche ultra moderne avec effet glassmorphism */}
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
                        {[searchTerm, filterDateRdvDebut, filterDateRdvFin, filterDateCreationDebut, filterDateCreationFin, filterQualite, filterStatutConseiller].filter(Boolean).length}
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

          {/* Panel de filtres modernes */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-6 animate-slideDown">
              {/* Ligne 1: Plage dates RDV */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#175C64]" />
                    Date RDV - Début
                  </label>
                  <input
                    type="date"
                    value={filterDateRdvDebut}
                    onChange={(e) => setFilterDateRdvDebut(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 bg-white"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#175C64]" />
                    Date RDV - Fin
                  </label>
                  <input
                    type="date"
                    value={filterDateRdvFin}
                    onChange={(e) => setFilterDateRdvFin(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 bg-white"
                  />
                </div>
              </div>

              {/* Ligne 2: Plage dates création */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    Date Création - Début
                  </label>
                  <input
                    type="date"
                    value={filterDateCreationDebut}
                    onChange={(e) => setFilterDateCreationDebut(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    Date Création - Fin
                  </label>
                  <input
                    type="date"
                    value={filterDateCreationFin}
                    onChange={(e) => setFilterDateCreationFin(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white"
                  />
                </div>
              </div>

              {/* Ligne 3: Qualité et Statut Conseiller */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Validation Qualité
                  </label>
                  <select
                    value={filterQualite}
                    onChange={(e) => setFilterQualite(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white"
                  >
                    <option value="">📋 Tous les statuts</option>
                    <option value="valide">✅ Validé</option>
                    <option value="non_valide">⏳ Non validé</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-indigo-600" />
                    Réponse Conseiller
                  </label>
                  <select
                    value={filterStatutConseiller}
                    onChange={(e) => setFilterStatutConseiller(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white"
                  >
                    <option value="">📋 Tous les statuts</option>
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
          </>
        )}
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
