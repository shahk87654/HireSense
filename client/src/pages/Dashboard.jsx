import React, { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { api } from '../utils/api'
import { FaRocket, FaClock, FaCheckCircle, FaUserPlus } from 'react-icons/fa'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.get('/dashboard').then((res) => {
      if (!mounted) return
      setData(res.data)
    }).catch(() => {
      // No fallback data, data remains null
    }).finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const skeleton = (w = 40) => <div className="h-6 bg-slate-100 rounded animate-pulse" style={{ width: w }} />

  const recentActivities = [
    { icon: FaUserPlus, text: 'New candidate John Doe applied for Software Engineer', time: '2 hours ago', color: 'text-blue-500' },
    { icon: FaCheckCircle, text: 'Resume screening completed for 5 candidates', time: '4 hours ago', color: 'text-green-500' },
    { icon: FaRocket, text: 'AI analysis finished for Product Manager role', time: '6 hours ago', color: 'text-purple-500' },
    { icon: FaClock, text: 'Interview scheduled with Sarah Johnson', time: '1 day ago', color: 'text-orange-500' },
  ]

  const aiSummaries = [
    { role: 'Frontend Developer', summary: 'Strong focus on React and modern JavaScript. Candidates show excellent UI/UX understanding.', trend: '+12%' },
    { role: 'Data Scientist', summary: 'Python expertise prevalent. Machine learning skills vary significantly across applicants.', trend: '+8%' },
    { role: 'Product Manager', summary: 'Experience in agile methodologies. Communication skills are a key differentiator.', trend: '+15%' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white modern-shadow fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, HR Admin!</h1>
            <p className="text-blue-100 text-lg">Here's what's happening with your talent pipeline today.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FaRocket className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatCard title="Total Candidates" value={loading ? skeleton() : data?.total} data={[{v:10},{v:12},{v:8}]} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatCard title="Avg Fit Score" value={loading ? skeleton() : `${data?.avgFit}%`} data={[{v:6},{v:14},{v:9}]} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <StatCard title="Diversity Index" value={loading ? skeleton() : data?.diversity} data={[{v:3},{v:5},{v:2}]} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
          <StatCard title="Referrals" value={loading ? skeleton() : data?.referrals} data={[{v:2},{v:3},{v:4}]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl modern-shadow p-6 fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Recent Activities</h2>
            <div className="text-sm text-slate-500">Live updates</div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-lg bg-slate-100 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summaries */}
        <div className="bg-white rounded-2xl modern-shadow p-6 fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">AI Insights</h2>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-300 transition-colors">
              <option>All roles</option>
              <option>Technical</option>
              <option>Leadership</option>
            </select>
          </div>
          <div className="space-y-4">
            {aiSummaries.map((summary, index) => (
              <div key={index} className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800">{summary.role}</h3>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {summary.trend}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{summary.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
