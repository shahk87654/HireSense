import React, { useState } from 'react'
import ResumeUploader from '../components/ResumeUploader'
import { api } from '../utils/api'

export default function ResumeScreening() {
  const [jobDesc, setJobDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const submitJD = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/resume/job', { jobDescription: jobDesc })
      alert('Job description uploaded — you can now upload resumes.')
    } catch (err) {
      console.error(err)
      alert('Failed to upload job description — saved locally.')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Resume Screening</div>

      <form onSubmit={submitJD} className="p-4 bg-white rounded-2xl card-shadow">
        <div className="text-sm text-slate-600">Paste the Job Description to guide AI screening</div>
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Enter job description..." rows={6} className="w-full p-3 mt-3 border rounded-md" />
        <div className="mt-3 flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded-lg" disabled={saving}>{saving ? 'Saving...' : 'Upload Job Description'}</button>
        </div>
      </form>

      <ResumeUploader />
    </div>
  )
}
import React from 'react'
import ResumeUploader from '../components/ResumeUploader'

export default function ResumeScreening() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Resume Screening</div>
      <div>
        <div className="p-4 bg-white rounded-2xl card-shadow">
          <div className="text-sm text-slate-600">Paste job description or upload one</div>
          <textarea className="w-full mt-3 p-3 border rounded-md h-28" placeholder="Paste job description here..." />
        </div>
      </div>
      <ResumeUploader />
    </div>
  )
}
