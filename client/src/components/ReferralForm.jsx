import React, { useState } from 'react'
import { api } from '../utils/api'

export default function ReferralForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', role: '', department: '', referrerId: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/referral', form)
      setForm({ name: '', email: '', role: '', department: '', referrerId: '' })
      onSuccess && onSuccess()
      alert('Referral submitted')
    } catch (err) {
      console.error(err)
      alert('Failed to submit')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded-2xl card-shadow space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 border rounded-md" />
        <input required placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded-md" />
        <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="p-2 border rounded-md" />
        <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="p-2 border rounded-md" />
        <input placeholder="Referrer ID" value={form.referrerId} onChange={(e) => setForm({ ...form, referrerId: e.target.value })} className="p-2 border rounded-md col-span-2" />
      </div>
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-primary text-white rounded-lg" disabled={loading}>{loading ? 'Submitting...' : 'Submit Referral'}</button>
      </div>
    </form>
  )
}
