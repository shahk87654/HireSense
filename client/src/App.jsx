import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { motion } from 'framer-motion'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ResumeScreening = lazy(() => import('./pages/ResumeScreening'))
const ReferralPortal = lazy(() => import('./pages/ReferralPortal'))
const EmployeeReferral = lazy(() => import('./pages/EmployeeReferral'))

const TalentDiscovery = lazy(() => import('./pages/TalentDiscovery'))
const CultureFit = lazy(() => import('./pages/CultureFit'))

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const token = useAuthStore((s) => s.token)

  if (!token) {
    return (
      <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Loading...</div>}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/refer" element={<EmployeeReferral />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6">
          <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Loading...</div>}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/resume" element={<ProtectedRoute><ResumeScreening /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><ReferralPortal /></ProtectedRoute>} />
                <Route path="/refer" element={<EmployeeReferral />} />

                <Route path="/talent" element={<ProtectedRoute><TalentDiscovery /></ProtectedRoute>} />
                <Route path="/culture" element={<ProtectedRoute><CultureFit /></ProtectedRoute>} />
                <Route path="*" element={<div>Not Found</div>} />
              </Routes>
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
