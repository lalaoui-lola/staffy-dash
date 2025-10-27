'use client'

import { Database } from '@/lib/database.types'
import { Building, User, Phone, Mail, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type LeadWithAgent = Lead & { agent?: Profile | null }

interface TodayLeadsProps {
  leads: LeadWithAgent[]
}

export default function TodayLeads({ leads }: TodayLeadsProps) {
  function formatTime(timeString: string | null) {
    if (!timeString) return '-'
    return timeString.substring(0, 5)
  }

  // Trier par heure
  const sortedLeads = [...leads].sort((a, b) => {
    if (!a.heure_rdv) return 1
    if (!b.heure_rdv) return -1
    return a.heure_rdv.localeCompare(b.heure_rdv)
  })

  if (leads.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium text-lg">Aucun rendez-vous aujourd'hui</p>
        <p className="text-gray-500 text-sm mt-2">Profitez de cette journée tranquille ! 😊</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header avec stats */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-2">Rendez-vous du jour</h2>
            <p className="text-green-100">
              {leads.length} rendez-vous prévu{leads.length > 1 ? 's' : ''} aujourd'hui
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <Calendar className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Timeline des RDV */}
      <div className="space-y-4">
        {sortedLeads.map((lead, index) => (
          <div
            key={lead.id}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl hover:bg-white/80 transition-all duration-500 overflow-hidden animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Timeline indicator */}
            <div className="flex">
              {/* Heure */}
              <div className="w-32 bg-gradient-to-br from-[#175C64] to-[#0E3A40] p-6 flex flex-col items-center justify-center text-white">
                <Clock className="h-6 w-6 mb-2" />
                <div className="text-2xl font-black">{formatTime(lead.heure_rdv)}</div>
                <div className="text-xs text-white mt-1">Heure</div>
              </div>

              {/* Contenu */}
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-[#175C64]/10 p-2 rounded-lg">
                        <Building className="h-5 w-5 text-[#175C64]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{lead.nom_societe}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {lead.nom_client}
                        </p>
                      </div>
                    </div>

                    {/* Agent Badge */}
                    {lead.agent && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 mt-2">
                        <User className="h-3 w-3 mr-1 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700">
                          Agent: {lead.agent.full_name || lead.agent.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badge Validé */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Validé
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Phone */}
                  {lead.telephone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Téléphone</p>
                        <p className="font-semibold text-gray-900">{lead.telephone}</p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {lead.mail && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900 truncate">{lead.mail}</p>
                      </div>
                    </div>
                  )}

                  {/* Department */}
                  {lead.departement && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-500">Département</p>
                        <p className="font-semibold text-gray-900">{lead.departement}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comment */}
                {lead.commentaire && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-gray-700">{lead.commentaire}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
