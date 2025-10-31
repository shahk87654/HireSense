import React, { useState, useEffect } from 'react'
import ResumeUploader from '../components/ResumeUploader'
import { api } from '../utils/api'

export default function ResumeScreening() {
  const [jobDesc, setJobDesc] = useState({ title: '', description: '', department: '' })
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [errors, setErrors] = useState({})

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

  const validateForm = () => {
    const newErrors = {}
    if (!jobDesc.title.trim()) newErrors.title = 'Job title is required'
    if (!jobDesc.description.trim()) newErrors.description = 'Job description is required'
    if (!jobDesc.department.trim()) newErrors.department = 'Department is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitJD = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const res = await api.post('/jobs', jobDesc)
      if (res.data.success) {
        setJobs([res.data.job, ...jobs])
        setJobDesc({ title: '', description: '', department: '' })
        setSelectedJobId(res.data.job._id)
        setShowCreateForm(false)
        setErrors({})
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create job description')
    } finally {
      setSaving(false)
    }
  }

  const selectedJob = jobs.find(job => job._id === selectedJobId)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center slide-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Resume Screening
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Streamline your hiring process with AI-powered resume analysis and candidate matching
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Job Selection Section */}
        <div className="bg-white rounded-2xl card-shadow p-8 slide-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Select Job Description</h2>
              <p className="text-slate-600">Choose an existing job posting or create a new one for resume screening</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showCreateForm ? 'Cancel' : 'Create New Job'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-slate-600">Loading job descriptions...</span>
            </div>
          ) : (
            <>
              {/* Job Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {jobs.map(job => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJobId(job._id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 card-hover ${
                      selectedJobId === job._id
                        ? 'border-primary bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-2 ${selectedJobId === job._id ? 'bg-primary' : 'bg-slate-300'}`}></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">{job.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">{job.department}</p>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {job.description?.length > 100
                            ? `${job.description.substring(0, 100)}...`
                            : job.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {jobs.length === 0 && !showCreateForm && (
                <div className="text-center py-12 text-slate-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg mb-2">No job descriptions found</p>
                  <p className="text-sm">Create your first job description to get started</p>
                </div>
              )}
            </>
          )}

          {/* Create Job Form */}
          {showCreateForm && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Job Description</h3>
              <form onSubmit={submitJD} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={jobDesc.title}
                      onChange={(e) => setJobDesc({...jobDesc, title: e.target.value})}
                      placeholder="e.g. Senior Software Engineer"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        errors.title ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={jobDesc.department}
                      onChange={(e) => setJobDesc({...jobDesc, department: e.target.value})}
                      placeholder="e.g. Engineering"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        errors.department ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={jobDesc.description}
                    onChange={(e) => setJobDesc({...jobDesc, description: e.target.value})}
                    placeholder="Describe the role, responsibilities, required skills, and qualifications..."
                    rows={6}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-vertical ${
                      errors.description ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setJobDesc({ title: '', description: '', department: '' })
                      setErrors({})
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Create Job Description
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Resume Uploader Section */}
        {selectedJobId ? (
          <div className="slide-in">
            <ResumeUploader jobId={selectedJobId} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl card-shadow p-12 text-center slide-in">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Job Description</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Choose a job description above to start uploading and analyzing resumes for that position
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
