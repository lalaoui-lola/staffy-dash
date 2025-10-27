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
  nouveau: 'bg-blue-100 text-blue-800',
  contacte: 'bg-yellow-100 text-yellow-800',
  qualifie: 'bg-[#F7C7BB]/30 text-purple-800',
  negocie: 'bg-orange-100 text-orange-800',
  gagne: 'bg-green-100 text-green-800',
  perdu: 'bg-red-100 text-red-800',
}

const statusLabels = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  qualifie: 'Qualifié',
  negocie: 'Négocié',
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
                      {lead.prenom} {lead.nom}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      {lead.email && (
                        <span className="flex items-center mr-3">
                          <Mail className="h-3 w-3 mr-1" />
                          {lead.email}
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
                      <div className="font-medium">{lead.entreprise || '-'}</div>
                      {lead.poste && (
                        <div className="text-xs text-gray-500">{lead.poste}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.statut]}`}>
                    {statusLabels[lead.statut]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.budget ? `${lead.budget.toLocaleString('fr-FR')} €` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.source || '-'}
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
