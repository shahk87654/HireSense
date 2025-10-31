import React, { useEffect, useState } from 'react'
import ReferralForm from '../components/ReferralForm'
import { api } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReferralPortal() {
  const [list, setList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  })

  const fetchList = async () => {
    try {
      const res = await api.get('/referrals')
      const referrals = res.data || []
      setList(referrals)
      setFilteredList(referrals)
      calculateStats(referrals)
    } catch (e) {
      const demoData = [{ id: 1, candidateName: 'Demo Candidate', status: 'Pending', role: 'Software Engineer', department: 'Engineering', candidateEmail: 'demo@example.com', referrerName: 'John Doe', createdAt: new Date().toISOString() }]
      setList(demoData)
      setFilteredList(demoData)
      calculateStats(demoData)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (referrals) => {
    const stats = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'Pending').length,
      underReview: referrals.filter(r => r.status === 'Under Review').length,
      approved: referrals.filter(r => r.status === 'Approved').length,
      rejected: referrals.filter(r => r.status === 'Rejected').length
    }
    setStats(stats)
  }

  const updateStatus = async (id, newStatus) => {
    setUpdating(true)
    try {
      await api.put(`/referrals/${id}/status`, { status: newStatus })
      await fetchList() // Refresh the list
      setSelectedReferral(null) // Close modal
    } catch (e) {
      console.error('Failed to update status:', e)
      alert('Failed to update referral status')
    } finally {
      setUpdating(false)
    }
  }

  const deleteReferral = async (id) => {
    if (!confirm('Are you sure you want to delete this referral?')) return

    try {
      await api.delete(`/referrals/${id}`)
      await fetchList() // Refresh the list
      setSelectedReferral(null) // Close modal
    } catch (e) {
      console.error('Failed to delete referral:', e)
      alert('Failed to delete referral')
    }
  }

  const filterReferrals = () => {
    let filtered = list

    if (searchTerm) {
      filtered = filtered.filter(r =>
        (r.candidateName || r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    setFilteredList(filtered)
  }

  useEffect(() => { fetchList() }, [])
  useEffect(() => { filterReferrals() }, [searchTerm, statusFilter, list])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-badge status-pending'
      case 'Under Review': return 'status-badge status-under-review'
      case 'Approved': return 'status-badge status-approved'
      case 'Rejected': return 'status-badge status-rejected'
      default: return 'status-badge status-pending'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center slide-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Referral Portal
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Manage employee referrals and track candidate progress through the hiring pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="stats-card rounded-2xl p-6 text-center">
            <div className="stats-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-90">Total Referrals</div>
          </div>

          <div className="bg-yellow-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>

          <div className="bg-blue-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-800">{stats.underReview}</div>
            <div className="text-sm text-blue-700">Under Review</div>
          </div>

          <div className="bg-green-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
            <div className="text-sm text-green-700">Approved</div>
          </div>

          <div className="bg-red-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
            <div className="text-sm text-red-700">Rejected</div>
          </div>
        </motion.div>

        {/* Referral Form */}
        <motion.div
          className="slide-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ReferralForm onSuccess={fetchList} />
        </motion.div>

        {/* Referrals List */}
        <motion.div
          className="bg-white rounded-2xl card-shadow p-8 slide-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">All Referrals</h2>
              <p className="text-slate-600">Track and manage employee referral submissions</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, role, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-slate-600">Loading referrals...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg mb-2">No referrals found</p>
                  <p className="text-sm">Referrals matching your criteria will appear here</p>
                </div>
              ) : (
                filteredList.map((r, index) => (
                  <motion.div
                    key={r._id || r.id}
                    className="referral-card rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {(r.candidateName || r.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{r.candidateName || r.name}</h3>
                            <p className="text-sm text-slate-500">{r.role || 'No role specified'}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {r.candidateEmail || r.email || 'No email'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {r.department || 'No department'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <div className={getStatusBadgeClass(r.status)}>
                          {r.status}
                        </div>
                        <button
                          onClick={() => setSelectedReferral(r)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>

        {/* Referral Details Modal */}
        <AnimatePresence>
          {selectedReferral && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-slate-800">Referral Details</h3>
                  <button
                    onClick={() => setSelectedReferral(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      {(selectedReferral.candidateName || selectedReferral.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-slate-800">{selectedReferral.candidateName || selectedReferral.name}</h4>
                      <p className="text-slate-600">{selectedReferral.role || 'No role specified'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{selectedReferral.candidateEmail || selectedReferral.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{selectedReferral.department || 'N/A'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Referrer</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{selectedReferral.referrerName || selectedReferral.referrerId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                        <select
                          value={selectedReferral.status}
                          onChange={(e) => updateStatus(selectedReferral._id || selectedReferral.id, e.target.value)}
                          disabled={updating}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Created Date</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(selectedReferral.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Last Updated</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{new Date(selectedReferral.updatedAt || selectedReferral.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => deleteReferral(selectedReferral._id || selectedReferral.id)}
                    className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Referral
                  </button>
                  <button
                    onClick={() => setSelectedReferral(null)}
                    className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
