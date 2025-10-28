'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import ConseillerSidebar from '@/components/ConseillerSidebar'
import AllLeadsTable from '@/components/AllLeadsTable'
import CalendarView from '@/components/CalendarView'
import TodayLeads from '@/components/TodayLeads'
import ConseillerSuiviModal from '@/components/ConseillerSuiviModal'
import { Users, Target, CheckCircle, TrendingUp, Calendar as CalendarIcon, Clock, BarChart3, MessageSquare, X } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type LeadWithAgent = Lead & { agent?: Profile | null; conseiller?: Profile | null }

export default function ConseillerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leads, setLeads] = useState<LeadWithAgent[]>([])
  const [conseillers, setConseillers] = useState<Profile[]>([])
  const [stats, setStats] = useState({
    nombreRdv: 0,           // Nombre de RDV validés qualité
    nombreRdvOk: 0,         // Nombre de RDV avec statut OK
    rdvAujourdhui: 0,       // RDV dont date_rdv = aujourd'hui
    tauxOk: 0,              // Taux OK / nombre RDV
    rdvCetteSemaine: 0,     // RDV dont date_rdv cette semaine
    rdvCeMois: 0,           // RDV dont date_rdv ce mois
    rdvPrisAujourdhui: 0,   // RDV dont date_creation = aujourd'hui
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all-leads' | 'no-feedback' | 'today-rdv' | 'calendar'>('dashboard')
  const [dateRdvDebut, setDateRdvDebut] = useState<string>('')
  const [dateRdvFin, setDateRdvFin] = useState<string>('')
  const [dateCreationDebut, setDateCreationDebut] = useState<string>('')
  const [dateCreationFin, setDateCreationFin] = useState<string>('')
  const [conseillerFilter, setConseillerFilter] = useState<string>('')
  const [statutConseillerFilter, setStatutConseillerFilter] = useState<string>('')
  const [suiviLead, setSuiviLead] = useState<Lead | null>(null)

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

    if (!typedProfile || typedProfile.role !== 'conseiller') {
      router.push('/login')
      return
    }

    setUser(session.user)
    setProfile(typedProfile)
    loadLeads(session.user.id)
  }

  async function loadLeads(userId: string) {
    setLoading(true)

    // Charger TOUS les leads validés avec les infos des agents et conseillers
    const { data: leadsData, error } = await supabase
      .from('leads')
      .select(`
        *,
        agent:agent_id(id, email, full_name, role),
        conseiller:conseiller_suivi_id(id, email, full_name, role)
      `)
      .eq('qualite', 'valide')  // Uniquement les leads validés
      .order('date_rdv', { ascending: true })

    // Debug logging
    console.log('🔍 Conseiller - Chargement des leads')
    console.log('📊 Nombre de leads reçus:', leadsData?.length || 0)
    console.log('❌ Erreur:', error)
    if (leadsData && leadsData.length > 0) {
      console.log('✅ Premier lead:', leadsData[0])
    }

    if (error) {
      console.error('Erreur lors du chargement des leads:', error)
    }

    if (leadsData) {
      const typedLeadsData = leadsData as LeadWithAgent[]
      setLeads(typedLeadsData)
      
      // Calculer les statistiques
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Début et fin de la semaine (lundi à dimanche)
      const startOfWeek = new Date(today)
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Lundi
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      // Début et fin du mois
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      
      // Nombre de RDV validés qualité
      const nombreRdv = typedLeadsData.length
      
      // Nombre de RDV OK (statut_conseiller = 'ok')
      const nombreRdvOk = typedLeadsData.filter(l => l.statut_conseiller === 'ok').length
      
      // RDV aujourd'hui
      const rdvAujourdhui = typedLeadsData.filter(l => l.date_rdv === todayStr).length
      
      // Taux OK
      const tauxOk = nombreRdv > 0 ? Math.round((nombreRdvOk / nombreRdv) * 100) : 0
      
      // RDV cette semaine
      const rdvCetteSemaine = typedLeadsData.filter(l => {
        if (!l.date_rdv) return false
        const rdvDate = new Date(l.date_rdv + 'T00:00:00')
        return rdvDate >= startOfWeek && rdvDate <= endOfWeek
      }).length
      
      // RDV ce mois
      const rdvCeMois = typedLeadsData.filter(l => {
        if (!l.date_rdv) return false
        const rdvDate = new Date(l.date_rdv + 'T00:00:00')
        return rdvDate >= startOfMonth && rdvDate <= endOfMonth
      }).length
      
      // RDV pris aujourd'hui (date_creation = aujourd'hui)
      const rdvPrisAujourdhui = typedLeadsData.filter(l => {
        if (!l.created_at) return false
        const createdDate = new Date(l.created_at).toISOString().split('T')[0]
        return createdDate === todayStr
      }).length
      
      setStats({
        nombreRdv,
        nombreRdvOk,
        rdvAujourdhui,
        tauxOk,
        rdvCetteSemaine,
        rdvCeMois,
        rdvPrisAujourdhui,
      })
    }

    // Charger la liste des conseillers
    const { data: conseillersData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'conseiller')
      .order('full_name', { ascending: true })

    if (conseillersData) {
      setConseillers(conseillersData)
    }

    setLoading(false)
  }

  // Filtrer les leads sans retour conseiller
  const leadsNoFeedback = leads.filter(lead => lead.statut_conseiller === 'en_attente')
  
  // Filtrer les RDV d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  const todayRdvLeads = leads.filter(lead => lead.date_rdv === today)
  
  // Appliquer les filtres de date et statut conseiller
  const getFilteredLeads = (baseLeads: LeadWithAgent[]) => {
    let filtered = baseLeads
    
    // Filtre par plage de dates RDV
    if (dateRdvDebut) {
      filtered = filtered.filter(l => l.date_rdv && l.date_rdv >= dateRdvDebut)
    }
    if (dateRdvFin) {
      filtered = filtered.filter(l => l.date_rdv && l.date_rdv <= dateRdvFin)
    }
    
    // Filtre par plage de dates création
    if (dateCreationDebut) {
      filtered = filtered.filter(l => {
        if (!l.created_at) return false
        const createdDate = new Date(l.created_at).toISOString().split('T')[0]
        return createdDate >= dateCreationDebut
      })
    }
    if (dateCreationFin) {
      filtered = filtered.filter(l => {
        if (!l.created_at) return false
        const createdDate = new Date(l.created_at).toISOString().split('T')[0]
        return createdDate <= dateCreationFin
      })
    }
    
    // Filtre par conseiller
    if (conseillerFilter) {
      filtered = filtered.filter(l => l.conseiller_suivi_id === conseillerFilter)
    }
    
    // Filtre par statut conseiller
    if (statutConseillerFilter) {
      filtered = filtered.filter(l => l.statut_conseiller === statutConseillerFilter)
    }
    
    return filtered
  }

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
          <p className="mt-6 text-lg font-bold text-gray-700 animate-pulse">Chargement de vos leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F2] via-[#F7C7BB]/30 to-[#EEF2F2]">
      <Navbar userName={profile?.full_name || profile?.email} userRole="conseiller" />
      
      {/* Sidebar */}
      <ConseillerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="ml-64 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        {/* Hero Header Ultra Moderne */}
        <div className="mb-10 animate-fadeInDown">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#0E3A40] rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#175C64] to-[#0E3A40] p-4 rounded-2xl shadow-xl">
                {activeTab === 'dashboard' ? (
                  <BarChart3 className="h-8 w-8 text-white" />
                ) : activeTab === 'all-leads' ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : activeTab === 'no-feedback' ? (
                  <MessageSquare className="h-8 w-8 text-white" />
                ) : activeTab === 'today-rdv' ? (
                  <Clock className="h-8 w-8 text-white" />
                ) : (
                  <CalendarIcon className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40] mb-1">
                {activeTab === 'dashboard' ? 'Dashboard Conseiller' : 
                 activeTab === 'all-leads' ? 'Tous les Leads' :
                 activeTab === 'no-feedback' ? 'Leads sans Retour' :
                 activeTab === 'today-rdv' ? 'RDV Aujourd\'hui' :
                 'Calendrier'}
              </h1>
              <p className="text-gray-600 font-medium">
                {activeTab === 'dashboard' ? '📊 Vue d\'ensemble de vos statistiques' : 
                 activeTab === 'all-leads' ? '✨ Tous les leads validés par la qualité' :
                 activeTab === 'no-feedback' ? '⏳ Leads en attente de votre retour' :
                 activeTab === 'today-rdv' ? '🕐 Rendez-vous programmés pour aujourd\'hui' :
                 '📅 Vue mensuelle de vos rendez-vous'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Affichées uniquement sur l'onglet dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="animate-slideUp">
              <StatsCard
                title="Nombre de RDV"
                value={stats.nombreRdv}
                icon={CheckCircle}
                color="green"
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
              <StatsCard
                title="RDV OK"
                value={stats.nombreRdvOk}
                icon={Target}
                color="blue"
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
              <StatsCard
                title="RDV Aujourd'hui"
                value={stats.rdvAujourdhui}
                icon={Clock}
                color="indigo"
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
              <StatsCard
                title="Taux OK"
                value={`${stats.tauxOk}%`}
                icon={TrendingUp}
                color="purple"
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
              <StatsCard
                title="RDV Cette Semaine"
                value={stats.rdvCetteSemaine}
                icon={CalendarIcon}
                color="orange"
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '500ms' }}>
              <StatsCard
                title="RDV Ce Mois"
                value={stats.rdvCeMois}
                icon={BarChart3}
                color="teal"
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '600ms' }}>
              <StatsCard
                title="RDV Pris Aujourd'hui"
                value={stats.rdvPrisAujourdhui}
                icon={Users}
                color="yellow"
              />
            </div>
          </div>
        )}

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'dashboard' ? (
          /* Dashboard avec statistiques */
          <div className="animate-fadeIn">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40] mb-4">
                📊 Vue d'ensemble
              </h2>
              <p className="text-gray-600 mb-6">
                Statistiques complètes de vos rendez-vous validés
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-green-900">Performance Globale</h3>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Total RDV</span>
                      <span className="font-bold text-green-900">{stats.nombreRdv}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">RDV OK</span>
                      <span className="font-bold text-green-900">{stats.nombreRdvOk}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Taux de réussite</span>
                      <span className="font-bold text-green-900">{stats.tauxOk}%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-6 border border-[#175C64]/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#0E3A40]">Planning</h3>
                    <CalendarIcon className="h-6 w-6 text-[#175C64]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0E3A40]">Aujourd'hui</span>
                      <span className="font-bold text-[#0E3A40]">{stats.rdvAujourdhui}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0E3A40]">Cette semaine</span>
                      <span className="font-bold text-[#0E3A40]">{stats.rdvCetteSemaine}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0E3A40]">Ce mois</span>
                      <span className="font-bold text-[#0E3A40]">{stats.rdvCeMois}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0E3A40]">Pris aujourd'hui</span>
                      <span className="font-bold text-[#0E3A40]">{stats.rdvPrisAujourdhui}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'all-leads' ? (
          /* Tous les Leads */
          <>
            <div className="mb-8 animate-fadeIn">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40] mb-2">Tous les Leads Validés</h2>
                  <p className="text-gray-600 font-medium">
                    {getFilteredLeads(leads).length} lead(s) validé(s) par la qualité
                  </p>
                </div>

                {/* Filtres modernes */}
                <div className="space-y-6">
                  {/* Ligne 1: Plage dates RDV */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-[#175C64]" />
                        Date RDV - Début
                      </label>
                      <input
                        type="date"
                        value={dateRdvDebut}
                        onChange={(e) => setDateRdvDebut(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 bg-white"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-[#175C64]" />
                        Date RDV - Fin
                      </label>
                      <input
                        type="date"
                        value={dateRdvFin}
                        onChange={(e) => setDateRdvFin(e.target.value)}
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
                        value={dateCreationDebut}
                        onChange={(e) => setDateCreationDebut(e.target.value)}
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
                        value={dateCreationFin}
                        onChange={(e) => setDateCreationFin(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Ligne 3: Conseiller et Statut */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-indigo-600" />
                        Conseiller
                      </label>
                      <select
                        value={conseillerFilter}
                        onChange={(e) => setConseillerFilter(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white"
                      >
                        <option value="">👥 Tous les conseillers</option>
                        {conseillers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name || c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Réponse Conseiller
                      </label>
                      <select
                        value={statutConseillerFilter}
                        onChange={(e) => setStatutConseillerFilter(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white"
                      >
                        <option value="">📋 Tous les statuts</option>
                        <option value="ok">✅ OK</option>
                        <option value="nok">❌ NOK</option>
                        <option value="rappeler">📞 Rappeler</option>
                        <option value="en_attente">⏳ En attente</option>
                      </select>
                    </div>
                  </div>

                  {/* Bouton réinitialiser */}
                  {(dateRdvDebut || dateRdvFin || dateCreationDebut || dateCreationFin || conseillerFilter || statutConseillerFilter) && (
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          setDateRdvDebut('')
                          setDateRdvFin('')
                          setDateCreationDebut('')
                          setDateCreationFin('')
                          setConseillerFilter('')
                          setStatutConseillerFilter('')
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold flex items-center gap-2"
                      >
                        <X className="h-5 w-5" />
                        Réinitialiser les filtres
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="animate-fadeIn">
              <AllLeadsTable
                leads={getFilteredLeads(leads)}
                showValidateButton={false}
                showSuiviButton={true}
                onSuiviConseiller={(lead) => setSuiviLead(lead)}
              />
            </div>
          </>
        ) : activeTab === 'no-feedback' ? (
          /* Leads sans retour conseiller */
          <>
            <div className="mb-8 animate-fadeIn">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40] mb-2">Leads sans Retour</h2>
                  <p className="text-gray-600 font-medium">
                    {getFilteredLeads(leadsNoFeedback).length} lead(s) en attente de votre retour
                  </p>
                </div>

                {/* Filtres modernes */}
                <div className="space-y-6">
                  {/* Ligne 1: Plage dates RDV */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-[#175C64]" />
                        Date RDV - Début
                      </label>
                      <input
                        type="date"
                        value={dateRdvDebut}
                        onChange={(e) => setDateRdvDebut(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 bg-white"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-[#175C64]" />
                        Date RDV - Fin
                      </label>
                      <input
                        type="date"
                        value={dateRdvFin}
                        onChange={(e) => setDateRdvFin(e.target.value)}
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
                        value={dateCreationDebut}
                        onChange={(e) => setDateCreationDebut(e.target.value)}
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
                        value={dateCreationFin}
                        onChange={(e) => setDateCreationFin(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Ligne 3: Conseiller */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-indigo-600" />
                        Conseiller
                      </label>
                      <select
                        value={conseillerFilter}
                        onChange={(e) => setConseillerFilter(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white"
                      >
                        <option value="">👥 Tous les conseillers</option>
                        {conseillers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name || c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bouton réinitialiser */}
                  {(dateRdvDebut || dateRdvFin || dateCreationDebut || dateCreationFin || conseillerFilter) && (
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          setDateRdvDebut('')
                          setDateRdvFin('')
                          setDateCreationDebut('')
                          setDateCreationFin('')
                          setConseillerFilter('')
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold flex items-center gap-2"
                      >
                        <X className="h-5 w-5" />
                        Réinitialiser les filtres
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="animate-fadeIn">
              <AllLeadsTable
                leads={getFilteredLeads(leadsNoFeedback)}
                showValidateButton={false}
                showSuiviButton={true}
                onSuiviConseiller={(lead) => setSuiviLead(lead)}
              />
            </div>
          </>
        ) : activeTab === 'today-rdv' ? (
          /* RDV Aujourd'hui */
          <>
            <div className="mb-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">RDV Programmés Aujourd'hui</h2>
              <p className="text-gray-600">
                {todayRdvLeads.length} rendez-vous prévu(s) pour aujourd'hui
              </p>
            </div>

            <div className="animate-fadeIn">
              <AllLeadsTable
                leads={todayRdvLeads}
                showValidateButton={false}
                showSuiviButton={true}
                onSuiviConseiller={(lead) => setSuiviLead(lead)}
              />
            </div>
          </>
        ) : activeTab === 'calendar' ? (
          /* Calendrier */
          <CalendarView leads={leads} onLeadClick={(lead) => setSuiviLead(lead)} />
        ) : null}
      </main>

      {/* Modal de suivi conseiller */}
      {suiviLead && user && profile && (
        <ConseillerSuiviModal
          lead={suiviLead}
          conseillerId={user.id}
          conseillerName={profile.full_name || profile.email}
          onClose={() => setSuiviLead(null)}
          onSuiviUpdated={() => {
            loadLeads(user.id)
            setSuiviLead(null)
          }}
        />
      )}
    </div>
  )
}
