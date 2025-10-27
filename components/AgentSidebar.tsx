'use client'

import { LayoutDashboard, Calendar, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface AgentSidebarProps {
  activeTab: 'dashboard' | 'leads'
  onTabChange: (tab: 'dashboard' | 'leads') => void
  onAddLead: () => void
}

export default function AgentSidebar({ activeTab, onTabChange, onAddLead }: AgentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      gradient: 'from-brand-500 via-brand-1000 to-accent-500',
      hoverGradient: 'from-brand-teal via-brand-700 to-accent-600',
      bgColor: 'bg-[#EEF2F2]',
      textColor: 'text-[#0E3A40]'
    },
    {
      id: 'leads' as const,
      label: 'Mes Leads',
      icon: Calendar,
      gradient: 'from-brand-1000 via-accent-500 to-rose-500',
      hoverGradient: 'from-brand-dark via-pink-600 to-rose-600',
      bgColor: 'bg-[#F7C7BB]/20',
      textColor: 'text-purple-700'
    }
  ]

  return (
    <>
      {/* Sidebar avec effet glassmorphism */}
      <div 
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-2xl border-r border-white/20 shadow-2xl transition-all duration-500 ease-in-out z-40 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
        style={{
          boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.15)'
        }}
      >
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-brand-1000/5 to-accent-500/10 pointer-events-none rounded-r-3xl" />
        
        {/* Header avec animation */}
        <div className="relative p-6 border-b border-gradient-to-r from-brand-100 via-purple-100 to-pink-100">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3 animate-fadeIn">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#0E3A40] rounded-xl blur-lg opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-brand-teal via-brand-700 to-accent-600 p-2.5 rounded-xl shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-brand-700 to-accent-600">
                    Agent
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5 tracking-wide">
                    Menu de navigation
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="relative group p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-brand-50 hover:to-brand-100 transition-all duration-300 transform hover:scale-110"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#175C64] to-[#0E3A40] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#175C64] transition-colors" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-[#175C64] transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Items avec animations avancées */}
        <nav className="p-4 space-y-3 mt-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isHovered = hoveredItem === item.id
            
            return (
              <div
                key={item.id}
                className="relative"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Glow effect pour l'item actif */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-30 animate-pulse`} />
                )}
                
                <button
                  onClick={() => onTabChange(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative w-full flex items-center ${
                    collapsed ? 'justify-center' : 'justify-start'
                  } px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl`
                      : `${item.bgColor} ${item.textColor} hover:shadow-xl`
                  }`}
                >
                  {/* Animated background on hover */}
                  {!isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  )}
                  
                  {/* Icon avec animation */}
                  <div className={`relative ${collapsed ? '' : 'mr-4'} transform transition-transform duration-300 ${
                    isHovered ? 'scale-110 rotate-3' : ''
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isActive ? 'text-white' : ''
                    }`} />
                  </div>
                  
                  {/* Label avec animation */}
                  {!collapsed && (
                    <span className={`font-bold text-sm tracking-wide transition-all duration-300 ${
                      isActive ? 'text-white' : ''
                    }`}>
                      {item.label}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping absolute" />
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Add Lead Button avec effet premium */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
            
            <button
              onClick={onAddLead}
              className={`relative w-full flex items-center ${
                collapsed ? 'justify-center' : 'justify-center'
              } px-5 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden group`}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <Plus className={`h-6 w-6 ${collapsed ? '' : 'mr-2'} transform group-hover:rotate-90 transition-transform duration-300`} />
              {!collapsed && (
                <span className="relative z-10 tracking-wide">Ajouter Lead</span>
              )}
            </button>
          </div>
        </div>

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-50/50 via-brand-100/30 to-transparent pointer-events-none" />
      </div>

      {/* Spacer */}
      <div className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-500`} />

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
