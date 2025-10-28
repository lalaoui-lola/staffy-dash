'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Building2, User, Phone, Mail, Calendar, Clock, MessageSquare, FileText, MapPin, Hash, CheckCircle, Save } from 'lucide-react'
import { Database } from '@/lib/database.types'

type Lead = Database['public']['Tables']['leads']['Row']

interface EditLeadModalProps {
  lead: Lead
  onClose: () => void
  onLeadUpdated: () => void
}

export default function EditLeadModal({ lead, onClose, onLeadUpdated }: EditLeadModalProps) {
  const [formData, setFormData] = useState({
    nom_societe: lead.nom_societe,
    nom_client: lead.nom_client,
    telephone: lead.telephone || '',
    mail: lead.mail || '',
    formule_juridique: lead.formule_juridique || '',
    departement: lead.departement || '',
    numero_siret: lead.numero_siret || '',
    date_rdv: lead.date_rdv || '',
    heure_rdv: lead.heure_rdv || '',
    commentaire: lead.commentaire || '',
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const updateData = formData as any;
      const { error: updateError } = await supabase
        .from('leads')
        // @ts-ignore - Supabase type inference issue
        .update(updateData)
        .eq('id', lead.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onLeadUpdated()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError('Erreur lors de la modification: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-5xl w-full my-8 animate-slideUp max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Modifier le Rendez-vous</h2>
                <p className="text-blue-100 text-sm mt-1">{lead.nom_societe}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
              <p className="text-sm text-red-800 flex items-center">
                <X className="h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 animate-slideDown">
              <p className="text-sm text-green-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                ✅ Rendez-vous modifié avec succès !
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom Société */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la Société *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="nom_societe"
                  required
                  value={formData.nom_societe}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Nom Client */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du Client *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="nom_client"
                  required
                  value={formData.nom_client}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="mail"
                  value={formData.mail}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Date RDV */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date du RDV
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="date"
                  name="date_rdv"
                  value={formData.date_rdv}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Heure RDV */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Heure du RDV
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="time"
                  name="heure_rdv"
                  value={formData.heure_rdv}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Formule Juridique */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Formule Juridique
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="formule_juridique"
                  value={formData.formule_juridique}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Département */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Département
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="departement"
                  value={formData.departement}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Numéro SIRET */}
            <div className="group md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro SIRET
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="numero_siret"
                  value={formData.numero_siret}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={14}
                />
              </div>
            </div>

            {/* Commentaire */}
            <div className="group md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Commentaire
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <textarea
                  name="commentaire"
                  value={formData.commentaire}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all transform hover:scale-105"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Modification...
                </span>
              ) : success ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Modifié !
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
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
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
          .animate-shake {
            animation: shake 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  )
}
