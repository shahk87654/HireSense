import React from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export default function DiversityChart({ data }) {
  const gender = data?.gender || []
  const education = data?.education || []
  const COLORS = ['#60A5FA', '#F97316', '#34D399', '#F472B6']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="text-sm font-semibold mb-2">Gender</div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={gender} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
                {gender.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="text-sm font-semibold mb-2">Education</div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={education}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
