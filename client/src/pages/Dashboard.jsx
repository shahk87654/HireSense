import React, { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { api } from '../utils/api'
import { FaRocket } from 'react-icons/fa'

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
          <StatCard title="Total Candidates" value={loading ? skeleton() : data?.total} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatCard title="Avg Fit Score" value={loading ? skeleton() : `${data?.avgFit}%`} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <StatCard title="Diversity Index" value={loading ? skeleton() : data?.diversity} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
          <StatCard title="Referrals" value={loading ? skeleton() : data?.referrals} />
        </div>
      </div>


    </div>
  )
}
