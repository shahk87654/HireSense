import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import CandidateCard from './CandidateCard'

export default function ResumeUploader({ jobId }) {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [jobDetails, setJobDetails] = useState(null)

  useEffect(() => {
    if (jobId) {
      loadJobDetails()
    }
  }, [jobId])

  const loadJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}`)
      if (res.data.success) {
        setJobDetails(res.data.job)
      }
    } catch (err) {
      console.error('Failed to load job details:', err)
    }
  }

  const onFiles = (e) => setFiles(Array.from(e.target.files))

  const upload = async () => {
    if (!files.length || !jobId) return
    setLoading(true)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('resumes', f))
      fd.append('jobId', jobId)
      
      const res = await api.post('/resume/upload', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setResults(res.data?.candidates || [])
      setFiles([]) // Clear files after successful upload
    } catch (e) {
      console.error(e)
      setResults([{ name: 'Error', fit_score: 0, skills: [], reason: 'Upload failed' }])
    } finally {
      setLoading(false)
    }
  }

  const reanalyze = async (c) => {
    if (!jobId || !c._id) return
    try {
      const res = await api.post('/resume/reanalyze', { 
        id: c._id,
        jobId
      })
      if (res.data.success) {
        setResults((r) => r.map((x) => 
          x._id === c._id ? { ...x, ...res.data.candidate } : x
        ))
      }
    } catch (e) {
      console.error('Reanalysis failed:', e)
    }
  }

  return (
    <div className="space-y-4">
      {jobDetails && (
        <div className="p-4 bg-white rounded-2xl card-shadow">
          <div className="text-sm font-semibold">Current Job: {jobDetails.title}</div>
          <div className="text-xs text-slate-600 mt-1">{jobDetails.department}</div>
        </div>
      )}

      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="text-sm text-slate-600">Upload multiple resumes (PDF) for analysis</div>
        <div className="mt-3 flex items-center gap-3">
          <input 
            type="file" 
            multiple 
            accept="application/pdf" 
            onChange={onFiles}
            className="flex-1"
          />
          <button 
            onClick={upload} 
            disabled={loading || !jobId || !files.length} 
            className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Analyze Resumes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((c, i) => (
          <CandidateCard 
            key={c.id ?? i} 
            c={c} 
            onReanalyze={() => reanalyze(c)}
          />
        ))}
      </div>
    </div>
  )
}
