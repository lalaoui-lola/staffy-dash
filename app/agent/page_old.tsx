'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import LeadTable from '@/components/LeadTable'
import { Users, TrendingUp, CheckCircle, Clock, Plus } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function AgentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({
    totalLeads: 0,
    nouveaux: 0,
    enCours: 0,
    gagnes: 0,
  })
  const [loading, setLoading] = useState(true)

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

    // Charger les leads de l'agent
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .eq('agent_id', userId)
      .order('created_at', { ascending: false })

    if (leadsData) {
      setLeads(leadsData)
      
      // Calculer les statistiques
      setStats({
        totalLeads: leadsData.length,
        nouveaux: leadsData.filter(l => l.statut === 'nouveau').length,
        enCours: leadsData.filter(l => ['contacte', 'qualifie', 'negocie'].includes(l.statut)).length,
        gagnes: leadsData.filter(l => l.statut === 'gagne').length,
      })
    }

    setLoading(false)
  }

  async function handleAddLead() {
    // Pour l'instant, juste un placeholder
    alert('Fonctionnalité d\'ajout de lead à venir')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={profile?.full_name || profile?.email} userRole="agent" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Agent</h1>
          <p className="mt-2 text-gray-600">Gérez vos leads et suivez vos performances</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Mes Leads"
            value={stats.totalLeads}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Nouveaux"
            value={stats.nouveaux}
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard
            title="En Cours"
            value={stats.enCours}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Gagnés"
            value={stats.gagnes}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mes Leads</h2>
          <button
            onClick={handleAddLead}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Lead
          </button>
        </div>

        {/* Leads Table */}
        <LeadTable
          leads={leads}
          canEdit={true}
          canDelete={false}
        />

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Conseils pour optimiser vos conversions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Contactez les nouveaux leads dans les 24 heures</li>
            <li>• Mettez à jour régulièrement le statut de vos leads</li>
            <li>• Ajoutez des notes détaillées après chaque interaction</li>
            <li>• Priorisez les leads avec un budget défini</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
