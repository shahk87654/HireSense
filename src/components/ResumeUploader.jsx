import React, { useState } from 'react'
import { api } from '../utils/api'
import CandidateCard from './CandidateCard'

export default function ResumeUploader() {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const onFiles = (e) => setFiles(Array.from(e.target.files))

  const upload = async () => {
    if (!files.length) return
    setLoading(true)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('resumes', f))
      const res = await api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResults(res.data?.candidates || [{ name: 'No results', fit: 0, skills: [], summary: '' }])
    } catch (e) {
      console.error(e)
      setResults([{ name: 'Error', fit: 0, skills: [], summary: 'Upload failed' }])
    } finally { setLoading(false) }
  }

  const reanalyze = async (c) => {
    try {
      const res = await api.post('/resume/reanalyze', { id: c.id })
      // update local results
      setResults((r) => r.map((x) => (x.id === c.id ? { ...x, fit: res.data?.fit ?? x.fit } : x)))
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="text-sm text-slate-600">Upload multiple resumes (PDF) for analysis</div>
        <div className="mt-3 flex items-center gap-3">
          <input type="file" multiple accept="application/pdf" onChange={onFiles} />
          <button onClick={upload} disabled={loading} className="px-3 py-1 bg-primary text-white rounded-md">{loading ? 'Uploading...' : 'Send to AI'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((c, i) => <CandidateCard key={c.id ?? i} c={c} onReanalyze={reanalyze} />)}
      </div>
    </div>
  )
}
