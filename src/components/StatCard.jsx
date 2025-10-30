import React from 'react'
import { ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function StatCard({ title, value, color = 'bg-white', data = [] }) {
  return (
    <div className="p-4 bg-white rounded-2xl card-shadow flex-1 min-w-[180px]">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        <div style={{ width: 80, height: 36 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <Bar dataKey="v" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
