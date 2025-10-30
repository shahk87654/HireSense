import React from 'react'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts'

export default function CultureFitGraph({ score = 68 }) {
  const data = [{ name: 'fit', value: score, fill: '#2563EB' }]
  return (
    <div className="p-4 bg-white rounded-2xl card-shadow">
      <div className="text-sm font-semibold mb-2">Culture Fit</div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <RadialBarChart innerRadius="80%" outerRadius="100%" data={data} startAngle={180} endAngle={-180}>
            <RadialBar minAngle={15} background clockWise dataKey="value" />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-center text-xl font-bold">{score}%</div>
    </div>
  )
}
