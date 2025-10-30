import React, { useState } from 'react'
import { api } from '../utils/api'
import { motion } from 'framer-motion'

export default function TalentSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = async (term) => {
    setLoading(true)
    try {
      const res = await api.post('/talent/search', { q: term })
      setResults(res.data?.candidates || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-2xl card-shadow flex items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidates by skill, role, or location…" className="flex-1 p-2 border rounded-md" />
        <button onClick={() => search(q)} className="px-3 py-1 bg-primary text-white rounded-md">Search</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading && <div className="text-sm text-slate-500">Searching…</div>}
        {results.map((r) => (
          <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-white rounded-lg card-shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-slate-500">{r.skills?.join(', ')}</div>
              </div>
              <div className="text-sm text-slate-400">{r.location}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
