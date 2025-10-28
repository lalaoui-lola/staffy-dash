'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Récupérer le rôle de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const typedProfile = profile as { role: string } | null

      if (typedProfile) {
        // Rediriger selon le rôle
        switch (typedProfile.role) {
          case 'administrateur':
            router.push('/admin')
            break
          case 'agent':
            router.push('/agent')
            break
          case 'conseiller':
            router.push('/conseiller')
            break
          default:
            router.push('/login')
        }
      }
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}
