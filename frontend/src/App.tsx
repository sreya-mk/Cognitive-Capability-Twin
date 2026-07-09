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
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
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
        <div className="mx-auto max-w-7xl animate-fade-in" key={activeTab}>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <section className="glass p-8 rounded-3xl">
                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                  <div className="space-y-4">
                    <span className="stat-badge stat-badge-blue">Career intelligence platform</span>
                    <h2 className="text-4xl font-semibold text-slate-900 leading-tight">
                      Understand your growth, plan your next move, and simulate new opportunities.
                    </h2>
                    <p className="text-slate-600 text-lg leading-8 max-w-2xl">
                      The Cognitive Capability Twin turns your background into an interactive skill profile that helps you see where you are, where you are growing, and where your next opportunity could be.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button className="btn-primary" onClick={() => setActiveTab('dashboard')}>View dashboard</button>
                      <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setActiveTab('simulate')}>Try simulator</button>
                    </div>
                  </div>
                  <div className="glass-strong p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Current readiness</p>
                        <p className="text-3xl font-bold text-emerald-600">82%</p>
                      </div>
                      <span className="stat-badge stat-badge-green">On track</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Skill maturity</span>
                          <span>78%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500" style={{ width: '78%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Role readiness</span>
                          <span>84%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: '84%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <ProfileForm />
                <div className="glass p-6 rounded-2xl h-fit">
                  <p className="section-label">Why this is different</p>
                  <h3 className="text-xl font-semibold text-slate-900 mt-2">Your capability memory</h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    This platform treats your skills as an evolving system, not just a list. It helps you see how a single capability creates leverage across roles, growth stages, and future opportunities.
                  </p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">Scenario planning</p>
                      <p className="text-sm text-slate-600">Forecast how a new skill changes your role fit and employer signal.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">Capability memory</p>
                      <p className="text-sm text-slate-600">Keep a living record of your growth rather than a static resume.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Your Skill Dashboard</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    A transparent view of your capabilities, projected momentum, and opportunity landscape.
                  </p>
                </div>
                <span className="stat-badge stat-badge-blue">Heuristic Model</span>
              </div>
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
        style={{ borderTop: '1px solid rgba(148, 163, 184, 0.16)' }}
      >
        © 2026 Cognitive Capability Twin · Portfolio Demo ·{' '}
        <span className="text-slate-500">All ML labels are honest heuristics, not trained models</span>
      </footer>
    </div>
  )
}

export default App
