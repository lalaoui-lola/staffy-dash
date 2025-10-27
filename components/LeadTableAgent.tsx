'use client'

import { Database } from '@/lib/database.types'
import { Mail, Phone, Building, Calendar, Clock, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface LeadTableAgentProps {
  leads: (Lead & { conseiller?: Profile | null })[]
  onEdit?: (lead: Lead) => void
  onDelete?: (leadId: string) => void
}

export default function LeadTableAgent({ leads, onEdit, onDelete }: LeadTableAgentProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
          <p className="text-gray-500">Commencez par créer votre premier rendez-vous</p>
        </div>
      </div>
    )
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatTime(timeString: string | null) {
    if (!timeString) return '-'
    return timeString.substring(0, 5)
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {leads.map((lead, index) => (
        <div
          key={lead.id}
          className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl hover:bg-white/80 transition-all duration-500 overflow-hidden group animate-fadeIn"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Building className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{lead.nom_societe}</h3>
                    <p className="text-sm text-gray-600">{lead.nom_client}</p>
                  </div>
                </div>
              </div>

              {/* Badge Qualité */}
              <div className="flex items-center space-x-2">
                {lead.qualite === 'valide' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validé
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Non validé
                  </span>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Contact */}
              <div className="space-y-2">
                {lead.telephone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{lead.telephone}</span>
                  </div>
                )}
                {lead.mail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{lead.mail}</span>
                  </div>
                )}
              </div>

              {/* RDV */}
              <div className="space-y-2">
                {lead.date_rdv && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(lead.date_rdv)}</span>
                  </div>
                )}
                {lead.heure_rdv && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatTime(lead.heure_rdv)}</span>
                  </div>
                )}
              </div>

              {/* Infos société */}
              <div className="space-y-2">
                {lead.formule_juridique && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Forme: </span>
                    <span>{lead.formule_juridique}</span>
                  </div>
                )}
                {lead.departement && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Dép: </span>
                    <span>{lead.departement}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SIRET */}
            {lead.numero_siret && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SIRET</p>
                <p className="text-sm font-mono text-gray-900">{lead.numero_siret}</p>
              </div>
            )}

            {/* Commentaire Agent */}
            {lead.commentaire && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm font-bold text-blue-900 mb-1">💬 Commentaire Agent</p>
                <p className="text-sm text-gray-700">{lead.commentaire}</p>
              </div>
            )}

            {/* Suivi Conseiller */}
            {lead.commentaire_conseiller && lead.statut_conseiller !== 'en_attente' && (
              <div className={`mb-4 p-4 border-l-4 rounded-r-lg ${
                lead.statut_conseiller === 'ok'
                  ? 'bg-green-50 border-green-500'
                  : lead.statut_conseiller === 'non_ok'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-bold ${
                    lead.statut_conseiller === 'ok'
                      ? 'text-green-900'
                      : lead.statut_conseiller === 'non_ok'
                      ? 'text-red-900'
                      : 'text-yellow-900'
                  }`}>
                    💬 Suivi Conseiller
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    lead.statut_conseiller === 'ok'
                      ? 'bg-green-100 text-green-800'
                      : lead.statut_conseiller === 'non_ok'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lead.statut_conseiller === 'ok' ? '✓ OK' : 
                     lead.statut_conseiller === 'non_ok' ? '✗ Non OK' : 
                     '📞 À Rappeler'}
                  </span>
                </div>
                <div>
                  {lead.conseiller && (
                    <p className="text-xs font-bold text-gray-700 mb-1">
                      Conseiller : {lead.conseiller.full_name || lead.conseiller.email}
                    </p>
                  )}
                  <p className={`text-sm ${
                    lead.statut_conseiller === 'ok'
                      ? 'text-green-800'
                      : lead.statut_conseiller === 'non_ok'
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                    {lead.commentaire_conseiller}
                  </p>
                  {lead.date_suivi_conseiller && (
                    <p className="text-xs text-gray-500 mt-2">
                      Suivi le {formatDate(lead.date_suivi_conseiller)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer avec actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Créé le {formatDate(lead.date_creation)}
              </div>
              
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(lead)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#175C64] to-[#0E3A40] text-white text-sm font-bold rounded-lg hover:from-[#0E3A40] hover:to-[#175C64] transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
                        onDelete(lead.id)
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
