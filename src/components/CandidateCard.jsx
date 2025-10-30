import React from 'react'
import { motion } from 'framer-motion'

export default function CandidateCard({ c, onReanalyze }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-2xl card-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{c.name}</div>
          <div className="text-sm text-slate-500">{c.skills?.join(', ')}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{c.fit}%</div>
          <div className="text-xs text-slate-400">Fit Score</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-600">{c.summary}</div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => onReanalyze && onReanalyze(c)} className="text-sm px-3 py-1 rounded-md bg-primary text-white">Reanalyze</button>
      </div>
    </motion.div>
  )
}
