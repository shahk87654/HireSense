import React, { useState, useEffect } from 'react'
import ResumeUploader from '../components/ResumeUploader'
import { api } from '../utils/api'

export default function ResumeScreening() {
  const [jobDesc, setJobDesc] = useState({ title: '', description: '', department: '' })
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data.jobs || [])
    } catch (err) {
      console.error('Failed to load jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const submitJD = async (e) => {
    e.preventDefault()
    if (!jobDesc.title || !jobDesc.description) {
      alert('Please fill in both title and description')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/jobs', jobDesc)
      if (res.data.success) {
        setJobs([res.data.job, ...jobs])
        setJobDesc({ title: '', description: '', department: '' })
        setSelectedJobId(res.data.job._id)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create job description')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Resume Screening</div>

      <div className="p-4 bg-white rounded-2xl card-shadow">
        <div className="text-sm text-slate-600 mb-4">Select Job Description for Resume Screening</div>
        {loading ? (
          <div>Loading job descriptions...</div>
        ) : (
          <select 
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full p-2 border rounded-md mb-4"
          >
            <option value="">Select a job description...</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title} - {job.department}</option>
            ))}
          </select>
        )}

        <div className="text-sm text-slate-600">Create New Job Description</div>
        <form onSubmit={submitJD} className="space-y-4">
          <input
            type="text"
            value={jobDesc.title}
            onChange={(e) => setJobDesc({...jobDesc, title: e.target.value})}
            placeholder="Job Title"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            value={jobDesc.department}
            onChange={(e) => setJobDesc({...jobDesc, department: e.target.value})}
            placeholder="Department"
            className="w-full p-2 border rounded-md"
          />
          <textarea 
            value={jobDesc.description}
            onChange={(e) => setJobDesc({...jobDesc, description: e.target.value})}
            placeholder="Enter detailed job description..."
            rows={6}
            className="w-full p-3 border rounded-md"
          />
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-primary text-white rounded-lg" disabled={saving}>
              {saving ? 'Saving...' : 'Create Job Description'}
            </button>
          </div>
        </form>
      </div>

      {selectedJobId ? (
        <ResumeUploader jobId={selectedJobId} />
      ) : (
        <div className="p-4 bg-white rounded-2xl card-shadow text-center text-slate-600">
          Please select a job description to upload resumes
        </div>
      )}
    </div>
  )
}
