import React, { useState } from 'react'
import ProfileForm from './components/ProfileForm'
import SkillGraph from './components/SkillGraph'
import GrowthChart from './components/GrowthChart'
import Simulator from './components/Simulator'
import InsightsPanel from './components/InsightsPanel'
import InsightsHistory from './components/InsightsHistory'
import CopilotPanel from './components/CopilotPanel'
import InterviewLab from './components/InterviewLab'

const NAV_ITEMS = [
  { id: 'profile' as const, label: 'Profile Input', icon: '⚙' },
  { id: 'dashboard' as const, label: 'Dashboard', icon: '⬡' },
  { id: 'history' as const, label: 'History', icon: '📊' },
  { id: 'simulate' as const, label: 'Simulator', icon: '◈' },
]

function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard' | 'history' | 'simulate'>('profile')
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const showProfileArea = (message = '') => {
    setActiveTab('profile')
    setAccountOpen(false)
    setAccountMessage(message)
  }

  const showPrivacy = () => {
    setAccountOpen(false)
    setPrivacyOpen(true)
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-3"
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

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 lg:order-none lg:w-auto lg:pb-0">
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

        <div className="relative flex items-center gap-2">
          <span className="stat-badge stat-badge-green hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            Live Demo
          </span>
          <button
            type="button"
            aria-label="Open profile and settings menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen(open => !open)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 text-left hover:bg-white transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">DU</span>
            <span className="hidden md:block"><span className="block text-xs font-semibold text-slate-900">Demo User</span><span className="block text-[10px] text-slate-500">Account</span></span>
            <span className="text-xs text-slate-400">⌄</span>
          </button>
          {accountOpen && (
            <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">Demo User</p>
                <p className="text-xs text-slate-500">Profile workspace</p>
              </div>
              <button className="account-menu-item" onClick={() => showProfileArea()}><span>◎</span> Profile</button>
              <button className="account-menu-item" onClick={() => showProfileArea('Settings are available in your profile workspace.') }><span>⚙</span> Settings</button>
              <button className="account-menu-item" onClick={showPrivacy}><span>▣</span> Data &amp; Privacy</button>
              <button className="account-menu-item text-rose-600 hover:bg-rose-50" onClick={() => showProfileArea('Demo mode has no authentication session. Your saved profile remains in the database.') }><span>↪</span> Log out</button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10 p-6 overflow-auto">
        <div className="mx-auto max-w-7xl animate-fade-in" key={activeTab}>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {accountMessage && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{accountMessage}</div>}
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
                <ProfileForm onOpenPrivacy={() => { setPrivacyOpen(true); setAccountMessage('') }} />
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
              <CopilotPanel />
              <InterviewLab />
              <InsightsPanel />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkillGraph />
                <GrowthChart />
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Insights Timeline</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    View and compare your recommendations over time as your skills evolve.
                  </p>
                </div>
                <span className="stat-badge stat-badge-green">Growth tracking</span>
              </div>
              <InsightsHistory />
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

      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label">Data &amp; Privacy</p>
                <h2 id="privacy-title" className="mt-1 text-xl font-semibold text-slate-950">Where your information is stored</h2>
              </div>
              <button type="button" aria-label="Close privacy dialog" onClick={() => setPrivacyOpen(false)} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">This local demo stores your information in the backend SQLite database. It is not sent anywhere unless an LLM API key is configured for skill extraction.</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Database file</p><p className="mt-1 font-mono text-sm text-slate-900">backend/app.db</p></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3"><p className="text-sm font-semibold text-slate-900">Profile</p><p className="mt-1 text-xs text-slate-500">user_profile</p></div>
                <div className="rounded-xl border border-slate-200 p-3"><p className="text-sm font-semibold text-slate-900">Skills</p><p className="mt-1 text-xs text-slate-500">skills</p></div>
                <div className="rounded-xl border border-slate-200 p-3"><p className="text-sm font-semibold text-slate-900">Insights</p><p className="mt-1 text-xs text-slate-500">insight_records</p></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end"><button type="button" className="btn-primary" onClick={() => setPrivacyOpen(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
