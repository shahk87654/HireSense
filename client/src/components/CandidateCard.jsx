import React from 'react'
import { motion } from 'framer-motion'

export default function CandidateCard({ c, onReanalyze }) {
  const fitScore = c.fit_score || c.fit || 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl card-shadow card-hover slide-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {c.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-800">{c.name}</div>
            <div className="text-sm text-slate-500">Candidate</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-800">{fitScore}%</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Fit Score</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="progress-bar mb-2">
          <div
            className="progress-fill"
            style={{ '--progress-width': `${fitScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Match Quality</span>
          <span>{fitScore >= 80 ? 'Excellent' : fitScore >= 60 ? 'Good' : fitScore >= 40 ? 'Fair' : 'Poor'}</span>
        </div>
      </div>

      {c.skills && c.skills.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-700 mb-2">Key Skills</div>
          <div className="flex flex-wrap gap-2">
            {c.skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
            {c.skills.length > 4 && (
              <span className="skill-tag">+{c.skills.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      <div className="text-sm text-slate-600 mb-4 leading-relaxed">
        {c.experience_summary || c.summary || c.reason}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onReanalyze && onReanalyze(c)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          Reanalyze
        </button>
      </div>
    </motion.div>
  )
}
