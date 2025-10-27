import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'orange' | 'teal'
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-[#F7C7BB]/30 text-[#175C64]',
  indigo: 'bg-[#175C64]/10 text-[#175C64]',
  orange: 'bg-orange-100 text-orange-600',
  teal: 'bg-teal-100 text-teal-600',
}

export default function StatsCard({ title, value, icon: Icon, color = 'blue' }: StatsCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-2xl hover:bg-white/70 transition-all duration-500 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="mt-2 text-4xl font-black text-gray-900">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </div>
    </div>
  )
}
