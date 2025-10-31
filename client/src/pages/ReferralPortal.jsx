import React, { useEffect, useState } from 'react'
import ReferralForm from '../components/ReferralForm'
import { api } from '../utils/api'

export default function ReferralPortal() {
  const [list, setList] = useState([])
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [updating, setUpdating] = useState(false)

  const fetchList = async () => {
    try {
      const res = await api.get('/referrals')
      setList(res.data || [])
    } catch (e) {
      setList([{ id: 1, name: 'Demo Candidate', status: 'Pending' }])
    }
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

  useEffect(() => { fetchList() }, [])

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Referral Portal</div>
      <ReferralForm onSuccess={fetchList} />

      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="font-semibold mb-3">Referrals</div>
        <div className="space-y-2">
          {list.map(r => (
            <div key={r._id || r.id} className="p-3 border rounded-md flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.candidateName || r.name}</div>
                <div className="text-sm text-slate-500">{r.role || ''}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">{r.status}</div>
                <button
                  onClick={() => setSelectedReferral(r)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Details Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 card-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Referral Details</h3>
              <button
                onClick={() => setSelectedReferral(null)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Name:</span>
                <span>{selectedReferral.candidateName || selectedReferral.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Email:</span>
                <span>{selectedReferral.candidateEmail || selectedReferral.email || 'N/A'}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Role:</span>
                <span>{selectedReferral.role || 'N/A'}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Department:</span>
                <span>{selectedReferral.department || 'N/A'}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Referrer:</span>
                <span>{selectedReferral.referrerName || selectedReferral.referrerId || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Status:</span>
                <select
                  value={selectedReferral.status}
                  onChange={(e) => updateStatus(selectedReferral._id || selectedReferral.id, e.target.value)}
                  disabled={updating}
                  className="px-2 py-1 text-xs rounded border"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Created:</span>
                <span>{new Date(selectedReferral.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => deleteReferral(selectedReferral._id || selectedReferral.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Delete Referral
              </button>
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
