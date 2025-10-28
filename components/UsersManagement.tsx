'use client'

import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { Users, Edit, Trash2, Key, Mail, User, Shield, Search, X } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UsersManagementProps {
  users: Profile[]
  onUserUpdated: () => void
}

export default function UsersManagement({ users, onUserUpdated }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [changingPassword, setChangingPassword] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Supprimer un utilisateur
  async function handleDeleteUser(userId: string, userEmail: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) return

    setLoading(true)
    setError('')

    try {
      // Appeler la fonction Supabase pour supprimer l'utilisateur
      const { error: deleteError } = await supabase.rpc('delete_user', {
        user_id: userId
      } as any)

      if (deleteError) throw deleteError

      setSuccess('Utilisateur supprimé avec succès')
      setTimeout(() => setSuccess(''), 3000)
      onUserUpdated()
    } catch (err: any) {
      setError('Erreur lors de la suppression: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Modifier un utilisateur
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type inference issue
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role
        })
        .eq('id', editingUser.id)

      if (updateError) throw updateError

      setSuccess('Utilisateur modifié avec succès')
      setTimeout(() => setSuccess(''), 3000)
      setEditingUser(null)
      onUserUpdated()
    } catch (err: any) {
      setError('Erreur lors de la modification: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Changer le mot de passe
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!changingPassword || !newPassword) return

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: pwdError } = await supabase.rpc('change_user_password', {
        user_id: changingPassword.id,
        new_password: newPassword
      } as any)

      if (pwdError) throw pwdError

      setSuccess('Mot de passe modifié avec succès')
      setTimeout(() => setSuccess(''), 3000)
      setChangingPassword(null)
      setNewPassword('')
    } catch (err: any) {
      setError('Erreur lors du changement de mot de passe: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      administrateur: 'bg-red-100 text-red-800 border-red-200',
      agent: 'bg-blue-100 text-blue-800 border-blue-200',
      conseiller: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 animate-fadeIn">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 animate-fadeIn">
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/30">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#175C64] transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Rechercher un utilisateur par nom ou email..."
            className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#175C64]/20 focus:border-[#175C64] transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl hover:bg-white/80 transition-all duration-500 p-6 animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              {/* Info utilisateur */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-gradient-to-r from-brand-100 to-purple-100 p-4 rounded-2xl">
                  <User className="h-6 w-6 text-[#175C64]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{user.full_name || 'Sans nom'}</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(user.role)}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all transform hover:scale-110"
                  title="Modifier"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setChangingPassword(user)}
                  className="p-3 bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition-all transform hover:scale-110"
                  title="Changer le mot de passe"
                >
                  <Key className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all transform hover:scale-110"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-600 to-brand-teal p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Edit className="h-6 w-6 mr-3" />
                  <h2 className="text-2xl font-bold">Modifier l'utilisateur</h2>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email (non modifiable)
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="agent">Agent</option>
                  <option value="conseiller">Conseiller</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-brand-teal text-white rounded-xl font-bold hover:from-blue-700 hover:to-brand-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {changingPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20 animate-fadeIn">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Key className="h-6 w-6 mr-3" />
                  <h2 className="text-2xl font-bold">Changer le mot de passe</h2>
                </div>
                <button
                  onClick={() => {
                    setChangingPassword(null)
                    setNewPassword('')
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Utilisateur
                </label>
                <input
                  type="text"
                  value={changingPassword.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500"
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(null)
                    setNewPassword('')
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-bold hover:from-yellow-700 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Changer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
