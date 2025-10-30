import React, { useState } from 'react'
import { api } from '../utils/api'
import CultureFitGraph from '../components/CultureFitGraph'

export default function CultureFit() {
  const [text, setText] = useState('')
  const [score, setScore] = useState(72)
  const [loading, setLoading] = useState(false)

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
    <div className="space-y-6">
      <div className="text-xl font-semibold">Culture Fit</div>
      <div className="p-4 bg-white rounded-2xl card-shadow">
        <textarea className="w-full p-3 border rounded-md" rows={6} placeholder="Paste transcript or resume text here" value={text} onChange={(e) => setText(e.target.value)}></textarea>
        <div className="mt-3 flex justify-end">
          <button onClick={analyze} className="px-3 py-1 bg-primary text-white rounded-md">{loading ? 'Analyzing...' : 'Compare'}</button>
        </div>
      </div>
      <CultureFitGraph score={score} />
    </div>
  )
}
