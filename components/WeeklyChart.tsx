'use client'

interface WeeklyChartProps {
  data: { day: string; count: number }[]
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  console.log('📊 WeeklyChart - Données détaillées:', data.map(d => `${d.day}: ${d.count}`))
  console.log('📊 WeeklyChart - Total RDV:', data.reduce((sum, d) => sum + d.count, 0))
  const maxCount = Math.max(...data.map(d => d.count), 1)
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">📅 RDV Créés Cette Semaine</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          console.log(`🔍 Rendu de ${item.day}: count=${item.count}, type=${typeof item.count}`)
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
          const isToday = item.day === getDayName(new Date())
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isToday ? 'text-[#0E3A40] font-bold' : 'text-gray-700'}`}>
                  {item.day} {isToday && '(Aujourd\'hui)'}
                </span>
                <span className={`text-sm font-bold ${
                  item.count > 0 ? 'text-[#175C64]' : 'text-gray-400'
                }`}>
                  {item.count} RDV
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div 
                  className={`h-8 rounded-full transition-all duration-1000 flex items-center justify-end pr-3 ${
                    isToday 
                      ? 'bg-gradient-to-r from-[#175C64] to-[#0E3A40]' 
                      : 'bg-gradient-to-r from-indigo-400 to-brand-500'
                  }`}
                  style={{ 
                    width: `${percentage}%`,
                    minWidth: item.count > 0 ? '40px' : '0'
                  }}
                >
                  {item.count > 0 && (
                    <span className="text-white text-xs font-bold">
                      {item.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Résumé */}
      <div className="mt-6 p-4 bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl border border-[#175C64]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#0E3A40] font-medium">Total cette semaine</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#175C64] to-[#0E3A40]">
              {data.reduce((sum, d) => sum + d.count, 0)} RDV
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#0E3A40] font-medium">Moyenne / jour</p>
            <p className="text-2xl font-black text-[#175C64]">
              {(data.reduce((sum, d) => sum + d.count, 0) / 5).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Meilleur jour */}
      {maxCount > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-900 font-medium text-center">
            🏆 Meilleur jour : {data.find(d => d.count === maxCount)?.day} ({maxCount} RDV)
          </p>
        </div>
      )}
    </div>
  )
}

function getDayName(date: Date): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[date.getDay()]
}
