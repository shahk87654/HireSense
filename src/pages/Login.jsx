import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { api } from '../utils/api'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const t = res.data?.token || 'demo-token'
      setToken(t)
      setUser(res.data?.user || { name: 'HR Admin', email })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Login failed — using demo token')
      setToken('demo-token')
      setUser({ name: 'HR Admin', email })
      navigate('/dashboard')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-24">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-white rounded-2xl card-shadow">
        <motion.div className="mb-4 text-center text-2xl font-semibold" animate={{ rotate: [0, 8, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          HireSense
        </motion.div>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" />
          <button className="w-full py-3 bg-primary text-white rounded-2xl" disabled={loading}>{loading ? 'Logging in…' : 'Login to Dashboard'}</button>
        </form>
      </motion.div>
    </div>
  )
}
