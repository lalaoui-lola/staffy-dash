'use client'

import { useState } from 'react'
import { BarChart3, List, MessageSquare, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface ConseillerSidebarProps {
  activeTab: 'dashboard' | 'all-leads' | 'no-feedback' | 'today-rdv' | 'calendar'
  onTabChange: (tab: 'dashboard' | 'all-leads' | 'no-feedback' | 'today-rdv' | 'calendar') => void
}

export default function ConseillerSidebar({ activeTab, onTabChange }: ConseillerSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'all-leads' as const,
      label: 'Tous les Leads',
      icon: List,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'no-feedback' as const,
      label: 'Leads sans Retour',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      iconColor: 'text-orange-600'
    },
    {
      id: 'today-rdv' as const,
      label: 'RDV Aujourd\'hui',
      icon: Clock,
      gradient: 'from-brand-500 to-blue-500',
      bgGradient: 'from-brand-50 to-blue-50',
      iconColor: 'text-[#175C64]'
    },
    {
      id: 'calendar' as const,
      label: 'Calendrier',
      icon: Calendar,
      gradient: 'from-brand-1000 to-accent-500',
      bgGradient: 'from-brand-100 to-accent-50',
      iconColor: 'text-[#175C64]'
    }
  ]

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-500 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-brand-50/80 to-brand-100/80 backdrop-blur-2xl border-r border-white/30 shadow-2xl">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-brand-1000/5 to-accent-500/5 animate-gradient"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 bg-gradient-to-r from-[#175C64] to-[#0E3A40] text-white p-2 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative">
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </div>
        </button>

        {/* Header */}
        {!collapsed && (
          <div className="p-6 pb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#0E3A40] rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#175C64] to-[#0E3A40] p-4 rounded-2xl shadow-xl">
                <h2 className="text-white font-black text-lg tracking-tight">Conseiller</h2>
                <p className="text-white text-xs mt-1 font-medium">Gestion des RDV</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <div
                key={item.id}
                className="animate-slideInLeft"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isActive ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  {/* Background */}
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} opacity-100`
                        : `bg-gradient-to-r ${item.bgGradient} opacity-0 group-hover:opacity-100`
                    }`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>

                  {/* Glow effect for active */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} blur-xl opacity-50 -z-10`}></div>
                  )}

                  {/* Content */}
                  <div className="relative flex items-center gap-3 px-4 py-3">
                    {/* Icon container */}
                    <div
                      className={`p-2.5 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white/20 shadow-lg'
                          : `bg-white/50 group-hover:bg-white/80 group-hover:shadow-md`
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 transition-all duration-300 ${
                          isActive ? 'text-white' : `${item.iconColor} group-hover:scale-110`
                        }`}
                      />
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span
                        className={`font-bold text-sm transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive && !collapsed && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
