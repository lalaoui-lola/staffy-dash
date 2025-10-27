'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Lock, Mail, AlertCircle, LogIn } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      if (data.user) {
        // Récupérer le rôle de l'utilisateur
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          // Rediriger selon le rôle
          switch (profile.role) {
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
              setError('Rôle utilisateur non reconnu')
              setLoading(false)
          }
        }
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-accent-50 to-brand-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-8 animate-fadeInUp relative z-10">
        {/* Logo simple */}
        <div className="text-center">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="CRM Staffy Logo"
              width={200}
              height={200}
              className="mx-auto object-contain"
              priority
            />
          </div>
          
          <h2 className="mt-6 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-brand-600 to-brand-dark">
            CRM Staffy
          </h2>
          <p className="mt-3 text-brand-700 font-semibold text-lg">
            🚀 Bienvenue dans votre espace
          </p>
        </div>

        {/* Form avec effet glassmorphism */}
        <div className="bg-white/80 backdrop-blur-2xl py-10 px-8 shadow-2xl rounded-3xl border-2 border-white/50 hover:shadow-3xl transition-shadow duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start animate-fadeIn">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-brand-dark mb-2">
                📧 Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-teal" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-4 py-3 border-2 border-brand-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-teal transition-all duration-300 text-brand-dark font-medium"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-brand-dark mb-2">
                🔒 Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-teal" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-4 py-3 border-2 border-brand-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-teal transition-all duration-300 text-brand-dark font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-black rounded-2xl text-white bg-gradient-to-r from-brand-teal via-brand-600 to-brand-dark hover:from-brand-600 hover:via-brand-700 hover:to-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <LogIn className="h-5 w-5 mr-2 relative z-10" />
                <span className="relative z-10">{loading ? '⏳ Connexion en cours...' : '🚀 Se connecter'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-brand-700">
            🔒 Connexion sécurisée SSL
          </p>
          <p className="text-xs text-brand-600">
          
          </p>
        </div>
      </div>
    </div>
  )
}
