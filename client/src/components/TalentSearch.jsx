import React, { useState } from 'react'
import { api } from '../utils/api'
import { motion } from 'framer-motion'

export default function TalentSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [bulkResults, setBulkResults] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const search = async (term) => {
    setLoading(true)
    try {
      const res = await api.post('/talent/search', { q: term })
      setResults(res.data?.candidates || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  const handleBulkAnalysis = async () => {
    if (!jobDescription.trim() || !selectedFile) {
      alert('Please provide both job description and select a PDF file')
      return
    }

    setBulkLoading(true)
    const formData = new FormData()
    formData.append('jobDescription', jobDescription)
    selectedFile.forEach((file, index) => {
      formData.append('files', file)
    })

    try {
      const res = await api.post('/talent/bulk-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setBulkResults(res.data)
    } catch (e) {
      console.error(e)
      alert('Failed to analyze resumes')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => file.type === 'application/pdf')

    if (validFiles.length > 0) {
      setSelectedFile(validFiles)
    } else {
      alert('Please select PDF files only')
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Search Section */}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Search Existing Candidates</div>
        <div className="p-4 bg-white rounded-2xl card-shadow flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search candidates by skill, role, or location…"
            className="flex-1 p-2 border rounded-md"
          />
          <button
            onClick={() => search(q)}
            className="px-3 py-1 bg-primary text-white rounded-md"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {loading && <div className="text-sm text-slate-500">Searching…</div>}
          {results.map((r, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-white rounded-lg card-shadow"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-slate-500">{r.skills?.join(', ')}</div>
                </div>
                <div className="text-sm text-slate-400">Fit Score: {r.fit_score}%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Bulk Analysis Section */}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Bulk Resume Analysis</div>
        <div className="p-4 bg-white rounded-2xl card-shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter the job requirements, skills needed, experience level, etc."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Files (PDF files) *
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.length} file(s)
              </div>
            )}
          </div>

          <button
            onClick={handleBulkAnalysis}
            disabled={bulkLoading || !jobDescription.trim() || !selectedFile}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {bulkLoading ? 'Analyzing Resumes...' : 'Analyze Resumes'}
          </button>
        </div>
      </div>

      {/* Bulk Results Display */}
      {bulkResults && (
        <div className="space-y-4">
          <div className="text-lg font-semibold">Analysis Results</div>
          <div className="p-4 bg-white rounded-2xl card-shadow">
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                <strong>Total Resumes:</strong> {bulkResults.totalResumes}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <strong>Job Description:</strong> {bulkResults.jobDescription}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bulkResults.results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">{result.name}</div>
                      <div className="text-sm text-gray-600">Resume #{result.resumeNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">#{result.ranking}</div>
                      <div className="text-sm text-gray-600">Rank</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Overall Fit Score</div>
                      <div className="text-2xl font-bold text-green-600">{result.fit_score}%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Culture Fit</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {result.reason.includes('Culture fit indicators:') ?
                          result.reason.split('Culture fit indicators:')[1].split('.')[0].trim() || 'None detected' :
                          'Not assessed'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Education</div>
                      <div className="text-sm text-gray-600">{result.education || 'Not specified'}</div>
                    </div>
                  </div>

                  {result.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Key Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {result.skills.slice(0, 8).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {result.skills.length > 8 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{result.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <strong>Analysis:</strong> {result.reason}
                  </div>

                  {result.experience_summary && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Experience:</strong> {result.experience_summary.substring(0, 150)}...
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
