'use client'

import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Building, X } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type LeadWithAgent = Lead & { agent?: Profile | null }

interface CalendarViewProps {
  leads: LeadWithAgent[]
  onLeadClick?: (lead: Lead) => void
}

export default function CalendarView({ leads, onLeadClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDayLeads, setSelectedDayLeads] = useState<LeadWithAgent[] | null>(null)

  // Obtenir le premier et dernier jour du mois
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  // Obtenir le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Nombre de jours dans le mois
  const daysInMonth = lastDayOfMonth.getDate()

  // Mois et année actuels
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const currentMonth = monthNames[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear()

  // Jours de la semaine
  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  // Fonction pour obtenir les leads d'un jour spécifique
  function getLeadsForDay(day: number): LeadWithAgent[] {
    const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leads.filter(lead => lead.date_rdv === dateStr)
  }

  // Navigation
  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  // Vérifier si c'est aujourd'hui
  function isToday(day: number): boolean {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Générer les jours du calendrier
  const calendarDays = []
  
  // Jours vides avant le début du mois
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-6">
      {/* Header du calendrier */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-brand-100 to-purple-100 p-3 rounded-2xl">
              <CalendarIcon className="h-6 w-6 text-[#175C64]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">
                {currentMonth} {currentYear}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {leads.length} rendez-vous ce mois-ci
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-3 bg-[#175C64]/10 text-[#175C64] rounded-xl hover:bg-indigo-200 transition-all transform hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-3 bg-gradient-to-r from-[#175C64] to-[#0E3A40] text-white rounded-xl font-bold hover:from-[#0E3A40] hover:to-[#175C64] transition-all transform hover:scale-105"
            >
              Aujourd'hui
            </button>
            <button
              onClick={nextMonth}
              className="p-3 bg-[#175C64]/10 text-[#175C64] rounded-xl hover:bg-indigo-200 transition-all transform hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {/* En-têtes des jours */}
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center font-bold text-gray-600 py-3 text-sm"
            >
              {day}
            </div>
          ))}

          {/* Jours du calendrier */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const dayLeads = getLeadsForDay(day)
            const today = isToday(day)

            return (
              <div
                key={day}
                className={`aspect-square p-2 rounded-2xl transition-all duration-300 ${
                  today
                    ? 'bg-gradient-to-br from-[#175C64] to-[#0E3A40] text-white shadow-lg'
                    : dayLeads.length > 0
                    ? 'bg-white border-2 border-[#175C64]/20 hover:border-indigo-400 hover:shadow-lg cursor-pointer'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="h-full flex flex-col">
                  {/* Numéro du jour */}
                  <div className={`text-sm font-bold mb-1 ${today ? 'text-white' : 'text-gray-900'}`}>
                    {day}
                  </div>

                  {/* Leads du jour */}
                  {dayLeads.length > 0 && (
                    <div className="flex-1 overflow-hidden">
                      <div className="space-y-1">
                        {dayLeads.slice(0, 2).map((lead) => (
                          <div
                            key={lead.id}
                            onClick={() => onLeadClick && onLeadClick(lead)}
                            className={`text-xs p-1 rounded truncate ${
                              today
                                ? 'bg-white/20 text-white'
                                : 'bg-[#175C64]/10 text-[#0E3A40] hover:bg-indigo-200'
                            }`}
                            title={`${lead.nom_societe} - ${lead.nom_client}`}
                          >
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate font-medium">{lead.nom_societe}</span>
                            </div>
                          </div>
                        ))}
                        {dayLeads.length > 2 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDayLeads(dayLeads)
                            }}
                            className={`text-xs p-1 rounded text-center font-bold cursor-pointer hover:scale-110 transition-transform ${
                              today
                                ? 'bg-white/20 text-white hover:bg-white/30'
                                : 'bg-indigo-200 text-[#0E3A40] hover:bg-indigo-300'
                            }`}
                          >
                            +{dayLeads.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl p-6 border border-white/30">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Légende</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#175C64] to-[#0E3A40] rounded-lg"></div>
            <span className="text-sm font-medium text-gray-700">Aujourd'hui</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white border-2 border-[#175C64]/20 rounded-lg"></div>
            <span className="text-sm font-medium text-gray-700">Jour avec RDV</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg"></div>
            <span className="text-sm font-medium text-gray-700">Jour sans RDV</span>
          </div>
        </div>
      </div>

      {/* Modal pour afficher tous les RDV d'un jour */}
      {selectedDayLeads && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">
                📅 {selectedDayLeads.length} RDV ce jour
              </h3>
              <button
                onClick={() => setSelectedDayLeads(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="space-y-3">
                {selectedDayLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => {
                      onLeadClick && onLeadClick(lead)
                      setSelectedDayLeads(null)
                    }}
                    className="bg-brand-50 hover:bg-brand-100 border-2 border-brand-200 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-5 w-5 text-brand-teal" />
                          <h4 className="font-bold text-brand-dark">{lead.nom_societe}</h4>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{lead.nom_client}</span>
                        </div>
                        {lead.agent && (
                          <div className="mt-2 text-xs text-gray-500">
                            Agent : {lead.agent.full_name || lead.agent.email}
                          </div>
                        )}
                      </div>
                      {lead.heure_rdv && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-brand-teal">
                            {lead.heure_rdv}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
