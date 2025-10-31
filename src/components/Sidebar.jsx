import React from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen border-r p-4 hidden md:block">
      <div className="mb-6">
        <div className="text-xl font-semibold">TalentX</div>
        <div className="text-sm text-slate-500">AI Talent Platform</div>
      </div>
      <nav className="flex flex-col gap-2">
        {ROUTES.map((r) => (
          <NavLink
            key={r.to}
            to={r.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm hover:bg-slate-100 ${isActive ? 'bg-slate-100 font-semibold' : 'text-slate-700'}`
            }
          >
            {r.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
