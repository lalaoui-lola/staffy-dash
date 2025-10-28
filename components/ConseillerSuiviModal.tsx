'use client'

import { useState } from 'react'
import { Database, StatutConseiller } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { X, MessageSquare, CheckCircle, XCircle, Phone } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']

interface ConseillerSuiviModalProps {
  lead: Lead
  conseillerId: string
  conseillerName: string
  onClose: () => void
  onSuiviUpdated: () => void
}

export default function ConseillerSuiviModal({
  lead,
  conseillerId,
  conseillerName,
  onClose,
  onSuiviUpdated
}: ConseillerSuiviModalProps) {
  const [statut, setStatut] = useState<StatutConseiller>(lead.statut_conseiller || 'en_attente')
  const [commentaire, setCommentaire] = useState(lead.commentaire_conseiller || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const updateData = {
        statut_conseiller: statut,
        commentaire_conseiller: commentaire,
        date_suivi_conseiller: new Date().toISOString(),
        conseiller_suivi_id: conseillerId
      };
      // @ts-ignore - Supabase type inference issue
      const { error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', lead.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        onSuiviUpdated()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError('Erreur lors de la mise à jour: ' + err.message)
      setLoading(false)
    }
  }

  const statutOptions = [
    { value: 'ok' as const, label: 'OK', icon: CheckCircle, color: 'green' },
    { value: 'nok' as const, label: 'Non OK', icon: XCircle, color: 'red' },
    { value: 'rappeler' as const, label: 'À Rappeler', icon: Phone, color: 'yellow' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#175C64] to-[#0E3A40] p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <MessageSquare className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Suivi Conseiller</h2>
                <p className="text-white text-sm mt-1">{lead.nom_societe}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 animate-fadeIn">
            <p className="text-green-800 font-medium flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Suivi enregistré avec succès !
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Lead Complète */}
          <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-5 border border-[#175C64]/20">
            <h3 className="text-sm font-bold text-[#0E3A40] mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Informations du RDV
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium mb-1">Société</p>
                <p className="text-gray-900 font-bold">{lead.nom_societe}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Client</p>
                <p className="text-gray-900 font-bold">{lead.nom_client}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Téléphone</p>
                <p className="text-gray-900 font-bold">{lead.telephone || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Email</p>
                <p className="text-gray-900 font-bold text-xs break-all">{lead.mail || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Date RDV</p>
                <p className="text-gray-900 font-bold">
                  {lead.date_rdv ? new Date(lead.date_rdv).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Heure RDV</p>
                <p className="text-gray-900 font-bold">{lead.heure_rdv || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Qualité</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                  lead.qualite === 'valide'
                    ? 'bg-green-100 text-green-800'
                    : lead.qualite === 'non_valide'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lead.qualite === 'valide' ? '✓ Validé' : 
                   lead.qualite === 'non_valide' ? '✗ Non Validé' : 
                   '⏳ En attente'}
                </span>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Date création</p>
                <p className="text-gray-900 font-bold text-xs">
                  {lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
            </div>
            {lead.commentaire && (
              <div className="mt-4 pt-4 border-t border-[#175C64]/20">
                <p className="text-gray-600 font-medium mb-1">Commentaire initial</p>
                <p className="text-gray-900 text-sm bg-white/50 rounded-lg p-3">{lead.commentaire}</p>
              </div>
            )}
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Statut du suivi *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statutOptions.map((option) => {
                const Icon = option.icon
                const isSelected = statut === option.value
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatut(option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? option.color === 'green'
                          ? 'bg-green-100 border-green-500 text-green-900'
                          : option.color === 'red'
                          ? 'bg-red-100 border-red-500 text-red-900'
                          : 'bg-yellow-100 border-yellow-500 text-yellow-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${
                      isSelected
                        ? option.color === 'green'
                          ? 'text-green-600'
                          : option.color === 'red'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                        : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-sm">{option.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Commentaire (visible par tous) *
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 min-h-[120px]"
              placeholder="Ajoutez votre commentaire sur ce lead..."
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Ce commentaire sera visible par l'administrateur et l'agent qui a créé le lead
            </p>
          </div>

          {/* Suivi précédent */}
          {lead.commentaire_conseiller && lead.statut_conseiller !== 'en_attente' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">Suivi précédent :</p>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                  lead.statut_conseiller === 'ok'
                    ? 'bg-green-100 text-green-800'
                    : lead.statut_conseiller === 'non_ok'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lead.statut_conseiller === 'ok' ? 'OK' : 
                   lead.statut_conseiller === 'non_ok' ? 'Non OK' : 
                   'À Rappeler'}
                </span>
                {lead.date_suivi_conseiller && (
                  <span className="text-xs text-blue-700">
                    {new Date(lead.date_suivi_conseiller).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-900 mb-1">Conseiller : {conseillerName}</p>
                <p className="text-sm text-blue-800">{lead.commentaire_conseiller}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !commentaire.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#175C64] to-[#0E3A40] text-white rounded-xl font-bold hover:from-[#0E3A40] hover:to-[#175C64] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le suivi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
