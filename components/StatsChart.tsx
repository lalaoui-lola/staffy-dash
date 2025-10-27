'use client'

interface StatsChartProps {
  totalRdv: number
  rdvValides: number
  rdvOk: number
}

export default function StatsChart({ totalRdv, rdvValides, rdvOk }: StatsChartProps) {
  const tauxValidation = totalRdv > 0 ? Math.round((rdvValides / totalRdv) * 100) : 0
  const tauxOk = totalRdv > 0 ? Math.round((rdvOk / totalRdv) * 100) : 0
  const tauxOkSurValides = rdvValides > 0 ? Math.round((rdvOk / rdvValides) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en barres */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Répartition des Leads</h3>
        
        <div className="space-y-4">
          {/* Total RDV */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total RDV</span>
              <span className="text-sm font-bold text-gray-900">{totalRdv}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* RDV Validés */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">RDV Validés</span>
              <span className="text-sm font-bold text-green-600">{rdvValides} ({tauxValidation}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${tauxValidation}%` }}
              />
            </div>
          </div>

          {/* RDV OK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">RDV OK (Conseiller)</span>
              <span className="text-sm font-bold text-[#175C64]">{rdvOk} ({tauxOk}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-1000 to-brand-dark h-3 rounded-full transition-all duration-1000"
                style={{ width: `${tauxOk}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique circulaire (Donut) */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 Taux de Réussite</h3>
        
        <div className="flex items-center justify-center">
          {/* Cercle de progression */}
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#E5E7EB"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(tauxOkSurValides / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Percentage text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#F7C7BB]">
                {tauxOkSurValides}%
              </span>
              <span className="text-xs text-gray-600 font-medium mt-1">Taux OK</span>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between p-3 bg-[#F7C7BB]/20 rounded-lg">
            <span className="text-sm font-medium text-purple-900">RDV OK</span>
            <span className="text-sm font-bold text-[#175C64]">{rdvOk}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">RDV Validés</span>
            <span className="text-sm font-bold text-gray-900">{rdvValides}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-900 font-medium text-center">
            {tauxOkSurValides >= 70 ? '🎉 Excellent taux de conversion !' :
             tauxOkSurValides >= 50 ? '👍 Bon taux de conversion' :
             tauxOkSurValides >= 30 ? '📈 Continuez vos efforts' :
             '💪 Améliorez votre suivi'}
          </p>
        </div>
      </div>
    </div>
  )
}
