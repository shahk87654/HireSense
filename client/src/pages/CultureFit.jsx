import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import CultureFitGraph from '../components/CultureFitGraph'

export default function CultureFit() {
  const [text, setText] = useState('')
  const [score, setScore] = useState(72)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgFitScore: 0,
    recentAnalyses: 0,
    highFitCount: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // This would typically fetch real stats from the API
      // For now, we'll use demo data
      setStats({
        totalAnalyses: 456,
        avgFitScore: 74,
        recentAnalyses: 23,
        highFitCount: 89
      })

      setRecentActivity([
        { id: 1, type: 'analysis', description: 'Analyzed resume for Software Engineer', score: 85, time: '5 minutes ago' },
        { id: 2, type: 'analysis', description: 'Culture fit assessment for Product Manager', score: 92, time: '1 hour ago' },
        { id: 3, type: 'analysis', description: 'Resume analysis for Data Scientist', score: 78, time: '2 hours ago' },
        { id: 4, type: 'analysis', description: 'Culture fit check for UX Designer', score: 88, time: '3 hours ago' }
      ])
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await api.post('/culturefit', { text })
      setScore(res.data?.score ?? 72)
    } catch (e) {
      console.error(e)
      setScore(72)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center slide-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Culture Fit Analysis
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Assess candidate cultural alignment through AI-powered analysis of resumes and interview transcripts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="stats-card rounded-2xl p-6 text-center">
            <div className="stats-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{stats.totalAnalyses.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Analyses</div>
          </div>

          <div className="bg-blue-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-800">{stats.avgFitScore}%</div>
            <div className="text-sm text-blue-700">Avg Fit Score</div>
          </div>

          <div className="bg-purple-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-purple-800">{stats.recentAnalyses}</div>
            <div className="text-sm text-purple-700">Recent Analyses</div>
          </div>

          <div className="bg-green-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-800">{stats.highFitCount}</div>
            <div className="text-sm text-green-700">High Fit Count</div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Recent Activity Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl card-shadow p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Analyses
              </h3>

              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        activity.score >= 80 ? 'bg-green-100 text-green-600' : activity.score >= 60 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {activity.score >= 80 ? '🎯' : activity.score >= 60 ? '⚡' : '❌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            activity.score >= 80 ? 'bg-green-100 text-green-700' : activity.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {activity.score}%
                          </span>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Analysis Section */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl card-shadow p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Culture Fit Analysis</h2>
              <textarea
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                rows={8}
                placeholder="Paste candidate's resume text, interview transcript, or any relevant information here for culture fit analysis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={analyze}
                  disabled={loading || !text.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Analyze Culture Fit
                    </>
                  )}
                </button>
              </div>
            </div>

            <CultureFitGraph score={score} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
