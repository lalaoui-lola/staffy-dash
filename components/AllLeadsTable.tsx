'use client'

import { Database } from '@/lib/database.types'
import { Building, User, Phone, Mail, Calendar, Clock, MapPin, Edit, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface AllLeadsTableProps {
  leads: (Lead & { agent?: Profile | null; conseiller?: Profile | null })[]
  onEdit?: (lead: Lead) => void
  onDelete?: (leadId: string) => void
  onValidate?: (leadId: string, newStatus: 'valide' | 'non_valide') => void
  showValidateButton?: boolean
  onSuiviConseiller?: (lead: Lead) => void
  showSuiviButton?: boolean
}

export default function AllLeadsTable({ leads, onEdit, onDelete, onValidate, showValidateButton = false, onSuiviConseiller, showSuiviButton = false }: AllLeadsTableProps) {
  function formatDate(dateString: string | null) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatTime(timeString: string | null) {
    if (!timeString) return '-'
    return timeString.substring(0, 5)
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Aucun lead trouvé</p>
      </div>
    )
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

              {/* Quality Badge */}
              <div>
                {lead.qualite === 'valide' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Validé
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <XCircle className="h-4 w-4 mr-1" />
                    Non validé
                  </span>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* RDV Date */}
              {lead.date_rdv && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#175C64]" />
                  <div>
                    <p className="text-xs text-gray-500">Date RDV</p>
                    <p className="font-semibold text-gray-900">{formatDate(lead.date_rdv)}</p>
                  </div>
                </div>
              )}

              {/* RDV Time */}
              {lead.heure_rdv && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-[#175C64]" />
                  <div>
                    <p className="text-xs text-gray-500">Heure</p>
                    <p className="font-semibold text-gray-900">{formatTime(lead.heure_rdv)}</p>
                  </div>
                </div>
              )}

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

              {/* Legal Form */}
              {lead.formule_juridique && (
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-[#175C64]" />
                  <div>
                    <p className="text-xs text-gray-500">Forme juridique</p>
                    <p className="font-semibold text-gray-900">{lead.formule_juridique}</p>
                  </div>
                </div>
              )}
            </div>

            {/* SIRET */}
            {lead.numero_siret && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SIRET</p>
                <p className="text-sm font-mono text-gray-900">{lead.numero_siret}</p>
              </div>
            )}

            {/* Comment */}
            {lead.commentaire && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Commentaire Agent:</p>
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

            {/* Footer with actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Créé le {formatDate(lead.date_creation)}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Bouton de validation (admin uniquement) */}
                {showValidateButton && onValidate && (
                  <button
                    onClick={() => {
                      const newStatus = lead.qualite === 'valide' ? 'non_valide' : 'valide'
                      const message = newStatus === 'valide' 
                        ? 'Valider ce lead ?' 
                        : 'Marquer ce lead comme non validé ?'
                      if (confirm(message)) {
                        onValidate(lead.id, newStatus)
                      }
                    }}
                    className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-sm ${
                      lead.qualite === 'valide'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {lead.qualite === 'valide' ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Invalider
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </>
                    )}
                  </button>
                )}

                {/* Bouton suivi conseiller */}
                {showSuiviButton && onSuiviConseiller && (
                  <button
                    onClick={() => onSuiviConseiller(lead)}
                    className="inline-flex items-center px-4 py-2 bg-[#0E3A40] text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-all transform hover:scale-105 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Suivi
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(lead)}
                    className="inline-flex items-center px-4 py-2 bg-[#175C64] text-white text-sm font-medium rounded-lg hover:bg-[#0E3A40] transition-all transform hover:scale-105 shadow-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) {
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
    </div>
  )
}
