'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'
import { UserRole } from '@/lib/database.types'

interface NavbarProps {
  userName?: string
  userRole: UserRole
}

const roleLabels: Record<UserRole, string> = {
  administrateur: 'Administrateur',
  agent: 'Agent',
  conseiller: 'Conseiller',
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo supprimé */}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-5 w-5 mr-2 text-gray-400" />
              <span className="font-medium">{userName || 'Utilisateur'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
