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
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJobForView, setSelectedJobForView] = useState(null)
  const [deletingJobId, setDeletingJobId] = useState(null)

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

  const handleViewJob = (job, e) => {
    e.stopPropagation()
    setSelectedJobForView(job)
    setShowJobModal(true)
  }

  const handleDeleteJob = async (jobId, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this job description? This action cannot be undone.')) {
      return
    }

    setDeletingJobId(jobId)
    try {
      await api.delete(`/jobs/${jobId}`)
      setJobs(jobs.filter(job => job._id !== jobId))
      if (selectedJobId === jobId) {
        setSelectedJobId(null)
      }
    } catch (err) {
      console.error('Failed to delete job:', err)
      alert('Failed to delete job description')
    } finally {
      setDeletingJobId(null)
    }
  }

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
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 card-hover relative ${
                      selectedJobId === job._id
                        ? 'border-primary bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3" onClick={() => setSelectedJobId(job._id)}>
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
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => handleViewJob(job, e)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        title="View full description"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteJob(job._id, e)}
                        disabled={deletingJobId === job._id}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete job description"
                      >
                        {deletingJobId === job._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
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

        {/* Job Modal */}
        {showJobModal && selectedJobForView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-800">{selectedJobForView.title}</h3>
                  <button
                    onClick={() => setShowJobModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1">{selectedJobForView.department}</p>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <h4 className="font-medium text-slate-700 mb-3">Job Description</h4>
                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {selectedJobForView.description}
                </div>
                {selectedJobForView.requirements && selectedJobForView.requirements.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-700 mb-3">Requirements</h4>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      {selectedJobForView.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedJobId(selectedJobForView._id)
                      setShowJobModal(false)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use for Screening
                  </button>
                  <button
                    onClick={() => setShowJobModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
