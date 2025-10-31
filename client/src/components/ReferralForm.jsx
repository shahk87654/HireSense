import React, { useState } from 'react'
import { api } from '../utils/api'
import { motion } from 'framer-motion'

export default function ReferralForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    referrerId: '',
    resume: null
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Customer Success',
    'Other'
  ]

  const roles = [
    'Software Engineer',
    'Senior Software Engineer',
    'Product Manager',
    'Designer',
    'Marketing Manager',
    'Sales Representative',
    'HR Specialist',
    'Data Analyst',
    'DevOps Engineer',
    'QA Engineer',
    'Other'
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'
    if (!form.role.trim()) newErrors.role = 'Role is required'
    if (!form.department.trim()) newErrors.department = 'Department is required'
    if (!form.referrerId.trim()) newErrors.referrerId = 'Referrer ID is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append('candidateName', form.name)
      formData.append('candidateEmail', form.email)
      formData.append('role', form.role)
      formData.append('department', form.department)
      formData.append('referrerId', form.referrerId)
      if (form.resume) {
        formData.append('resume', form.resume)
      }

      await api.post('/referral', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setForm({
        name: '',
        email: '',
        role: '',
        department: '',
        referrerId: '',
        resume: null
      })
      setSuccess(true)
      onSuccess && onSuccess()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to submit referral. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (file) => {
    if (file && file.type === 'application/pdf') {
      setForm({ ...form, resume: file })
      setErrors({ ...errors, resume: null })
    } else {
      setErrors({ ...errors, resume: 'Please upload a PDF file' })
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
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  return (
    <motion.div
      className="bg-white rounded-3xl card-shadow p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Submit a Referral</h2>
        <p className="text-slate-600">Help us find great talent by referring qualified candidates</p>
      </div>

      {success && (
        <motion.div
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 font-medium">Referral submitted successfully!</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Name */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Candidate Name *
            </label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder="Enter candidate's full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </motion.div>

          {/* Candidate Email */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Candidate Email *
            </label>
            <div className="relative">
              <input
                required
                type="email"
                placeholder="Enter candidate's email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </motion.div>

          {/* Role */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Position/Role *
            </label>
            <div className="relative">
              <select
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                  errors.role
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8" />
              </svg>
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </motion.div>

          {/* Department */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Department *
            </label>
            <div className="relative">
              <select
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                  errors.department
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
          </motion.div>

          {/* Referrer ID */}
          <motion.div
            className="md:col-span-2"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Employee ID *
            </label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder="Enter your employee ID"
                value={form.referrerId}
                onChange={(e) => setForm({ ...form, referrerId: e.target.value })}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                  errors.referrerId
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            {errors.referrerId && <p className="mt-1 text-sm text-red-600">{errors.referrerId}</p>}
          </motion.div>

          {/* Resume Upload */}
          <motion.div
            className="md:col-span-2"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resume (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                dragOver
                  ? 'border-primary bg-blue-50'
                  : errors.resume
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-600 mb-2">
                  {form.resume ? form.resume.name : 'Drop your resume here or click to browse'}
                </p>
                <p className="text-sm text-slate-500">PDF files only, max 10MB</p>
              </label>
            </div>
            {errors.resume && <p className="mt-1 text-sm text-red-600">{errors.resume}</p>}
          </motion.div>
        </div>

        {errors.submit && (
          <motion.div
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{errors.submit}</span>
            </div>
          </motion.div>
        )}

        <motion.div
          className="flex justify-end pt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Referral...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Referral
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
