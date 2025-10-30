import React from 'react'
import { useAuthStore } from '../context/authStore'
import { motion } from 'framer-motion'

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <motion.div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold" animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }}>HS</motion.div>
        <div className="text-sm text-slate-600">HireSense</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">{user?.name || 'HR Admin'}</div>
        <button onClick={() => logout()} className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:opacity-95 transition">Logout</button>
      </div>
    </nav>
  )
}
