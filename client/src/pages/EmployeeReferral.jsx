import React, { useState } from 'react'
import { api } from '../utils/api'

export default function EmployeeReferral() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    position: '',
    referrerName: '',
    referrerEmail: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/referrals/public', form)
      if (response.data.success) {
        setSubmitted(true)
        setForm({
          name: '',
          email: '',
          position: '',
          referrerName: '',
          referrerEmail: '',
          notes: ''
        })
      }
    } catch (err) {
      console.error(err)
      alert('Failed to submit referral. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center card-shadow">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Referral Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your referral. We'll review the candidate and get back to you soon.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Submit Another Referral
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full card-shadow">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Referral</h1>
          <p className="text-gray-600">
            Know someone who would be a great fit? Refer them to our team!
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Name *
            </label>
            <input
              required
              placeholder="Enter candidate's full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Email *
            </label>
            <input
              required
              type="email"
              placeholder="candidate@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position *
            </label>
            <input
              required
              placeholder="e.g., Software Engineer, Product Manager"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              required
              placeholder="Enter your full name"
              value={form.referrerName}
              onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email *
            </label>
            <input
              required
              type="email"
              placeholder="your.email@company.com"
              value={form.referrerEmail}
              onChange={(e) => setForm({ ...form, referrerEmail: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              placeholder="Why do you think this person would be a great fit? Any specific skills or experiences to highlight?"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Referral'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This referral will be reviewed by our HR team.</p>
          <p className="mt-1">By submitting, you confirm you have the candidate's permission to refer them.</p>
        </div>
      </div>
    </div>
  )
}
