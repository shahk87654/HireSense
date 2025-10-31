import React, { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import CandidateCard from './CandidateCard'

export default function ResumeUploader({ jobId }) {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [jobDetails, setJobDetails] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

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

  const onFiles = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
    setFiles(droppedFiles)
  }

  const upload = async () => {
    if (!files.length || !jobId) return
    setLoading(true)
    setUploadProgress(0)

    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('resumes', f))
      fd.append('jobId', jobId)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const res = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setResults(res.data?.candidates || [])
        setFiles([]) // Clear files after successful upload
        setUploadProgress(0)
      }, 500)

    } catch (e) {
      console.error(e)
      setResults([{ name: 'Error', fit_score: 0, skills: [], reason: 'Upload failed' }])
      setUploadProgress(0)
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

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {jobDetails && (
        <div className="p-6 bg-white rounded-2xl card-shadow slide-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-800">{jobDetails.title}</div>
              <div className="text-sm text-slate-500">{jobDetails.department}</div>
            </div>
          </div>
          <div className="text-sm text-slate-600 mt-3 leading-relaxed">
            {jobDetails.description?.length > 150
              ? `${jobDetails.description.substring(0, 150)}...`
              : jobDetails.description
            }
          </div>
        </div>
      )}

      <div className="p-6 bg-white rounded-2xl card-shadow slide-in">
        <div className="text-lg font-semibold text-slate-800 mb-4">Upload Resumes for Analysis</div>

        <div
          className={`file-preview ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={onFiles}
            className="hidden"
          />

          <div className="text-center">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-slate-600 font-medium mb-2">
              {dragOver ? 'Drop your resumes here' : 'Drag & drop PDF resumes here, or click to browse'}
            </div>
            <div className="text-sm text-slate-500">
              Supports multiple PDF files • Maximum 10MB each
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-slate-700">Selected Files ({files.length})</div>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Uploading and analyzing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ '--progress-width': `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={upload}
            disabled={loading || !jobId || !files.length}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Resumes
              </>
            )}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="slide-in">
          <div className="text-lg font-semibold text-slate-800 mb-4">
            Analysis Results ({results.length} candidates)
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((c, i) => (
              <CandidateCard
                key={c.id ?? i}
                c={c}
                onReanalyze={() => reanalyze(c)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
