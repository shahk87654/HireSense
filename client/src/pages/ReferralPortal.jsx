import React, { useEffect, useState } from 'react'
import ReferralForm from '../components/ReferralForm'
import { api } from '../utils/api'

export default function ReferralPortal() {
  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const res = await api.get('/referrals')
      setList(res.data || [])
    } catch (e) {
      setList([{ id: 1, name: 'Demo Candidate', status: 'Pending' }])
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
              <div className="text-sm text-slate-600">{r.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
