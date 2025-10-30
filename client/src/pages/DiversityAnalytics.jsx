import React, { useEffect, useState } from 'react'
import DiversityChart from '../components/DiversityChart'
import { api } from '../utils/api'

export default function DiversityAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/diversity')
      setData(res.data)
    } catch (e) {
      setData({ gender: [{name:'Male',value:60},{name:'Female',value:40}], education: [{name:'BSc',value:50},{name:'MSc',value:30}] })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Diversity Analytics</div>
        <div>
          <button onClick={fetch} className="px-3 py-1 bg-primary text-white rounded-md">Update Report</button>
        </div>
      </div>
      <DiversityChart data={data} />
      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="font-semibold">Diversity Index</div>
        <div className="text-2xl">{data?.index ?? 0.68}</div>
      </div>
    </div>
  )
}
