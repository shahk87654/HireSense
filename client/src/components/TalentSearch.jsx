import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'
import { useDropzone } from 'react-dropzone'
import Select from 'react-select'
import { CSVLink } from 'react-csv'

export default function TalentSearch({ activeTab }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [bulkResults, setBulkResults] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [sortBy, setSortBy] = useState('fit_score')
  const [filterBy, setFilterBy] = useState('all')
  const [searchHistory, setSearchHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setResults([])
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const res = await api.post('/talent/search', { q: term })
        const candidates = res.data?.candidates || []
        setResults(candidates)

        // Add to search history
        if (term.trim()) {
          setSearchHistory(prev => {
            const filtered = prev.filter(item => item !== term)
            return [term, ...filtered].slice(0, 5)
          })
        }

        // Generate suggestions based on results
        const skills = candidates.flatMap(c => c.skills || [])
        const uniqueSkills = [...new Set(skills)].slice(0, 5)
        setSuggestions(uniqueSkills)
      } catch (e) {
        console.error(e)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    debouncedSearch(q)
  }, [q, debouncedSearch])

  const handleBulkAnalysis = async () => {
    if (!jobDescription.trim() || !selectedFile) {
      alert('Please provide both job description and select PDF files')
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

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF files are allowed.')
    }

    if (validFiles.length > 0) {
      setSelectedFile(validFiles)
    } else {
      alert('Please select PDF files only')
      e.target.value = ''
    }
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

    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => file.type === 'application/pdf')

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF files are allowed.')
    }

    if (validFiles.length > 0) {
      setSelectedFile(validFiles)
    }
  }

  const sortedResults = React.useMemo(() => {
    let filtered = [...results]

    if (filterBy !== 'all') {
      const threshold = filterBy === 'high' ? 80 : filterBy === 'medium' ? 60 : 0
      filtered = filtered.filter(r => r.fit_score >= threshold)
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'fit_score') return b.fit_score - a.fit_score
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })
  }, [results, sortBy, filterBy])

  const exportResults = () => {
    if (!bulkResults) return

    const csvContent = [
      ['Rank', 'Name', 'Fit Score', 'Skills', 'Education', 'Analysis'].join(','),
      ...bulkResults.results.map(r => [
        r.ranking,
        `"${r.name}"`,
        r.fit_score,
        `"${r.skills.join(', ')}"`,
        `"${r.education || 'N/A'}"`,
        `"${r.reason.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'talent-analysis-results.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderSearchTab = () => (
    <div className="space-y-6">
      {/* Enhanced Search Section */}
      <motion.div
        className="talent-search-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Search Existing Candidates</h3>
            <p className="text-sm text-slate-600">Find candidates by skills, experience, or role</p>
          </div>
        </div>

        <div className="relative">
          <div className="search-input flex items-center gap-3 p-4 rounded-2xl">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search by skills, role, location, or experience level..."
              className="flex-1 bg-transparent border-0 outline-none text-slate-800 placeholder-slate-400"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl card-shadow p-4 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {suggestions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Suggested Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((skill, index) => (
                        <button
                          key={index}
                          onClick={() => setQ(skill)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchHistory.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Recent Searches</div>
                    <div className="space-y-1">
                      {searchHistory.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => setQ(term)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results Section */}
      {sortedResults.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              Found {sortedResults.length} candidate{sortedResults.length !== 1 ? 's' : ''}
            </h3>

            <div className="flex items-center gap-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Candidates</option>
                <option value="high">High Fit (80%+)</option>
                <option value="medium">Medium Fit (60%+)</option>
                <option value="low">Low Fit ({'<60%'})</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="fit_score">Sort by Fit Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {sortedResults.map((r, index) => (
                <motion.div
                  key={`${r.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="candidate-result-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {r.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-800">{r.name}</div>
                        <div className="text-sm text-slate-500">Candidate</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-bold text-lg ${
                        r.fit_score >= 80 ? 'fit-score-high' :
                        r.fit_score >= 60 ? 'fit-score-medium' : 'fit-score-low'
                      }`}>
                        {r.fit_score}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Fit Score</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="progress-bar mb-2">
                      <div
                        className="progress-fill"
                        style={{ '--progress-width': `${r.fit_score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Match Quality</span>
                      <span>{r.fit_score >= 80 ? 'Excellent' : r.fit_score >= 60 ? 'Good' : r.fit_score >= 40 ? 'Fair' : 'Poor'}</span>
                    </div>
                  </div>

                  {r.skills && r.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-slate-700 mb-2">Key Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {r.skills.slice(0, 6).map((skill, skillIndex) => (
                          <span key={skillIndex} className="skill-tag-enhanced">
                            {skill}
                          </span>
                        ))}
                        {r.skills.length > 6 && (
                          <span className="skill-tag-enhanced">
                            +{r.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-slate-600 leading-relaxed">
                    {r.experience_summary || r.summary || 'No summary available'}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {loading && (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="mt-2 text-slate-600">Searching candidates...</div>
        </motion.div>
      )}

      {!loading && q && sortedResults.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No candidates found</h3>
          <p className="text-slate-500">Try adjusting your search terms or filters</p>
        </motion.div>
      )}
    </div>
  )

  const renderBulkTab = () => (
    <div className="space-y-6">
      {/* Enhanced Bulk Analysis Section */}
      <motion.div
        className="talent-search-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Bulk Resume Analysis</h3>
            <p className="text-sm text-slate-600">Upload multiple resumes for AI-powered analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Description */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe the role, required skills, experience level, responsibilities, and qualifications..."
              rows={8}
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <div className="text-xs text-slate-500">
              Be specific about technical skills, years of experience, and key responsibilities
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Resume Files (PDF) *
            </label>

            <div
              className={`bulk-upload-zone p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? 'drag-over' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('bulk-file-input').click()}
            >
              <input
                id="bulk-file-input"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>

              <div className="text-slate-600 mb-2">
                {selectedFile ? (
                  <span className="font-medium text-primary">{selectedFile.length} file{selectedFile.length !== 1 ? 's' : ''} selected</span>
                ) : (
                  'Drop PDF files here or click to browse'
                )}
              </div>

              <div className="text-sm text-slate-500">
                Maximum 10 files, 10MB each
              </div>
            </div>

            {selectedFile && selectedFile.length > 0 && (
              <div className="space-y-2">
                {selectedFile.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                ))}
                {selectedFile.length > 3 && (
                  <div className="text-sm text-slate-500 text-center">
                    +{selectedFile.length - 3} more files
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleBulkAnalysis}
            disabled={bulkLoading || !jobDescription.trim() || !selectedFile}
            className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
          >
            {bulkLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Resumes...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analyze Resumes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Enhanced Bulk Results Display */}
      {bulkResults && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              Analysis Results ({bulkResults.totalResumes} resumes)
            </h3>
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl card-shadow p-4">
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-600">Job Description</div>
                  <div className="text-sm text-slate-800 mt-1 line-clamp-3">
                    {bulkResults.jobDescription}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{bulkResults.totalResumes}</div>
                  <div className="text-sm text-slate-600">Total Resumes Analyzed</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bulkResults.results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="candidate-result-card p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {result.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-800">{result.name}</div>
                        <div className="text-sm text-slate-500">Rank #{result.ranking}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-bold text-lg ${
                        result.fit_score >= 80 ? 'fit-score-high' :
                        result.fit_score >= 60 ? 'fit-score-medium' : 'fit-score-low'
                      }`}>
                        {result.fit_score}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Fit Score</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="progress-bar mb-2">
                      <div
                        className="progress-fill"
                        style={{ '--progress-width': `${result.fit_score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Match Quality</span>
                      <span>{result.fit_score >= 80 ? 'Excellent' : result.fit_score >= 60 ? 'Good' : result.fit_score >= 40 ? 'Fair' : 'Poor'}</span>
                    </div>
                  </div>

                  {result.skills && result.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-slate-700 mb-2">Key Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.slice(0, 6).map((skill, skillIndex) => (
                          <span key={skillIndex} className="skill-tag-enhanced">
                            {skill}
                          </span>
                        ))}
                        {result.skills.length > 6 && (
                          <span className="skill-tag-enhanced">
                            +{result.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-slate-600 leading-relaxed">
                    {result.reason || 'Analysis details not available'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {bulkLoading && (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="mt-2 text-slate-600">Analyzing resumes...</div>
        </motion.div>
      )}
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <motion.div
        className="talent-search-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Analytics Dashboard</h3>
            <p className="text-sm text-slate-600">Insights and performance metrics</p>
          </div>
        </div>

        <div className="text-center py-12">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Analytics Coming Soon</h3>
          <p className="text-slate-500">Advanced analytics and insights will be available here</p>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'bulk' && renderBulkTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
