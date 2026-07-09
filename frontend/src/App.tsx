import React, { useState } from 'react'
import ProfileForm from './components/ProfileForm'
import SkillGraph from './components/SkillGraph'
import GrowthChart from './components/GrowthChart'
import Simulator from './components/Simulator'

const NAV_ITEMS = [
  { id: 'profile' as const, label: 'Profile Input', icon: '⚙' },
  { id: 'dashboard' as const, label: 'Dashboard', icon: '⬡' },
  { id: 'simulate' as const, label: 'Simulator', icon: '◈' },
]

function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard' | 'simulate'>('profile')

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 flex flex-col relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #00d2ac, #00a8e8)' }}
          >
            ⬡
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text leading-none">Cognitive Capability Twin</h1>
            <p className="text-xs text-slate-500 mt-0.5">Personal Skill & Career Intelligence</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              className={`tab-btn ${activeTab === t.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="mr-1.5 opacity-70">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="stat-badge stat-badge-green">
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            Live Demo
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10 p-6 overflow-auto">
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">Your Skill Dashboard</h2>
                <span className="stat-badge stat-badge-blue">Heuristic Model</span>
              </div>
              <p className="text-slate-400 text-sm -mt-3">
                Skill map and projected growth powered by a transparent rule-based heuristic —{' '}
                <span className="text-slate-300">designed to be replaced by a trained LSTM/Prophet model once longitudinal data exists.</span>
              </p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkillGraph />
                <GrowthChart />
              </div>
            </div>
          )}
          {activeTab === 'simulate' && <Simulator />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 text-center text-xs text-slate-600"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        © 2026 Cognitive Capability Twin · Portfolio Demo ·{' '}
        <span className="text-slate-500">All ML labels are honest heuristics, not trained models</span>
      </footer>
    </div>
  )
}

export default App
