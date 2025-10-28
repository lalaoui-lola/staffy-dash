'use client'

import { Database } from '@/lib/database.types'
import { Mail, Phone, Building, Edit, Trash2 } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadTableProps {
  leads: Lead[]
  onEdit?: (lead: Lead) => void
  onDelete?: (leadId: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

const statusColors = {
  en_attente: 'bg-gray-100 text-gray-800',
  ok: 'bg-green-100 text-green-800',
  non_ok: 'bg-red-100 text-red-800',
  rappeler: 'bg-yellow-100 text-yellow-800',
}

const statusLabels = {
  en_attente: 'En attente',
  ok: 'OK',
  non_ok: 'Non OK',
  rappeler: 'À rappeler',
  gagne: 'Gagné',
  perdu: 'Perdu',
}

export default function LeadTable({ leads, onEdit, onDelete, canEdit = false, canDelete = false }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Aucun lead disponible</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              {(canEdit || canDelete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.nom_client}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      {lead.mail && (
                        <span className="flex items-center mr-3">
                          <Mail className="h-3 w-3 mr-1" />
                          {lead.mail}
                        </span>
                      )}
                      {lead.telephone && (
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.telephone}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">{lead.nom_societe || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.statut_conseiller as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[lead.statut_conseiller as keyof typeof statusLabels] || lead.statut_conseiller}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.departement || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.date_creation).toLocaleDateString('fr-FR')}
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {canEdit && onEdit && (
                        <button
                          onClick={() => onEdit(lead)}
                          className="text-primary-600 hover:text-primary-900 p-1 hover:bg-primary-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && onDelete && (
                        <button
                          onClick={() => onDelete(lead.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
