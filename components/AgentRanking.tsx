'use client'

import { Trophy, TrendingUp, Award, Medal } from 'lucide-react'

interface AgentStats {
  id: string
  name: string
  email: string
  totalRdv: number
  rdvValides: number
  rdvOk: number
  performance: number
}

interface AgentRankingProps {
  agents: AgentStats[]
  type: 'rdv' | 'performance'
}

export default function AgentRanking({ agents, type }: AgentRankingProps) {
  const sortedAgents = [...agents].sort((a, b) => {
    if (type === 'rdv') {
      return b.totalRdv - a.totalRdv
    } else {
      return b.performance - a.performance
    }
  })

  const topAgents = sortedAgents.slice(0, 5)

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
    }
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600'
      case 1:
        return 'from-gray-300 to-gray-500'
      case 2:
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-gray-200 to-gray-300'
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {type === 'rdv' ? '🏆 Top Agents - RDV' : '⭐ Top Agents - Performance'}
        </h3>
        {type === 'rdv' ? (
          <TrendingUp className="h-8 w-8 text-indigo-500" />
        ) : (
          <Trophy className="h-8 w-8 text-purple-500" />
        )}
      </div>

      <div className="space-y-3">
        {topAgents.map((agent, index) => (
          <div
            key={agent.id}
            className={`relative p-4 rounded-2xl transition-all duration-300 hover:scale-102 ${
              index === 0
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                : index === 1
                ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300'
                : index === 2
                ? 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Medal/Rank */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(index)} shadow-lg`}>
                  {getMedalIcon(index)}
                </div>

                {/* Agent Info */}
                <div>
                  <p className="font-bold text-gray-900">{agent.name || agent.email}</p>
                  <p className="text-xs text-gray-500">{agent.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                {type === 'rdv' ? (
                  <>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40]">
                      {agent.totalRdv}
                    </p>
                    <p className="text-xs text-gray-600">RDV créés</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#F7C7BB]">
                      {agent.performance}%
                    </p>
                    <p className="text-xs text-gray-600">Performance</p>
                  </>
                )}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-900">{agent.totalRdv}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Validés</p>
                <p className="text-sm font-bold text-green-600">{agent.rdvValides}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">OK</p>
                <p className="text-sm font-bold text-[#175C64]">{agent.rdvOk}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {topAgents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun agent pour le moment</p>
        </div>
      )}
    </div>
  )
}
