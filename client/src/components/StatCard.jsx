import React from 'react'
import { ResponsiveContainer, BarChart, Bar } from 'recharts'
import { FaUsers, FaChartLine, FaBalanceScale, FaUserFriends } from 'react-icons/fa'

const iconMap = {
  'Total Candidates': FaUsers,
  'Avg Fit Score': FaChartLine,
  'Diversity Index': FaBalanceScale,
  'Referrals': FaUserFriends,
}

const gradientMap = {
  'Total Candidates': 'from-blue-500 to-blue-600',
  'Avg Fit Score': 'from-green-500 to-green-600',
  'Diversity Index': 'from-purple-500 to-purple-600',
  'Referrals': 'from-orange-500 to-orange-600',
}

export default function StatCard({ title, value, color = 'bg-white', data = [] }) {
  const Icon = iconMap[title] || FaUsers
  const gradient = gradientMap[title] || 'from-blue-500 to-blue-600'

  return (
    <div className="p-6 bg-white rounded-2xl card-shadow flex-1 min-w-[220px] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{title}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
          <div className="text-sm text-slate-500">vs last month</div>
        </div>
        <div style={{ width: 100, height: 50 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <Bar dataKey="v" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
