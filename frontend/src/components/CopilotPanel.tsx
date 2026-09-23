import React, { useState } from 'react'
import axios from 'axios'

interface CopilotAction {
  period: string
  title: string
  action: string
  outcome: string
}

interface CopilotPlan {
  headline: string
  summary: string
  strengths: string[]
  focus_areas: string[]
  action_plan: CopilotAction[]
  mode: string
}

const CopilotPanel: React.FC = () => {
  const [plan, setPlan] = useState<CopilotPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generatePlan = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post<CopilotPlan>('/api/copilot')
      setPlan(response.data)
    } catch {
      setError('The copilot could not generate a plan. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="copilot-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="copilot-kicker">AI Career Copilot</span>
            <span className="stat-badge stat-badge-green">Personalized</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Turn your capability data into your next 30 days.</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Generate a focused plan from your saved profile, strongest skills, target role, and highest-leverage gaps.</p>
        </div>
        <button type="button" className="btn-primary" onClick={generatePlan} disabled={loading}>
          {loading ? 'Thinking...' : plan ? 'Refresh plan' : 'Generate AI plan'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {!plan && !loading && !error && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="copilot-preview"><span>01</span><p>Read your strongest signals</p></div>
          <div className="copilot-preview"><span>02</span><p>Find the next leverage gap</p></div>
          <div className="copilot-preview"><span>03</span><p>Build proof with a weekly plan</p></div>
        </div>
      )}

      {loading && <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/60" />}

      {plan && !loading && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-5">
              <p className="section-label">Copilot readout</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-950">{plan.headline}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-600">{plan.summary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/70 bg-slate-950 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Strongest signals</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{plan.strengths.join(' · ')}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Focus next</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{plan.focus_areas.join(' · ')}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3"><p className="section-label">30-day action plan</p><span className="text-xs text-slate-500">{plan.mode}</span></div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {plan.action_plan.map((action, index) => (
                <article key={action.period} className="copilot-action">
                  <div className="flex items-center justify-between"><span className="copilot-number">0{index + 1}</span><span className="text-xs font-semibold text-teal-700">{action.period}</span></div>
                  <h4 className="mt-4 text-sm font-semibold text-slate-950">{action.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.action}</p>
                  <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500"><strong className="text-slate-700">Outcome:</strong> {action.outcome}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default CopilotPanel
