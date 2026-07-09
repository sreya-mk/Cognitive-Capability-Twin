import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface SimResult {
  before: number
  after: number
  explanation: string
}

const Simulator: React.FC = () => {
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [selectedSkill, setSelectedSkill] = useState('')
  const [result, setResult] = useState<SimResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/config/skill_taxonomy.json')
      .then(r => r.json())
      .then((t: Record<string, unknown>) => setAvailableSkills(Object.keys(t)))
      .catch(() => {})
  }, [])

  const handleSimulate = async () => {
    if (!selectedSkill) return
    setLoading(true)
    setResult(null)
    try {
      const resp = await axios.post('/api/simulate', { new_skill: selectedSkill })
      setResult({
        before: resp.data.employability_before,
        after: resp.data.employability_after,
        explanation: resp.data.explanation,
      })
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }

  const delta = result ? result.after - result.before : 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Opportunity Simulator</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Pick a skill you don't currently have. We'll compute your new employability score against {' '}
          <span className="text-slate-300">15+ role templates</span> and explain the change using rule-based logic.{' '}
          <span className="stat-badge stat-badge-blue text-xs ml-1">Rule-based explainability</span>
        </p>
      </div>

      <div className="glass p-6 space-y-5">
        <div className="space-y-2">
          <label className="section-label">What if I learned…</label>
          <div className="flex gap-3">
            <select
              id="skill-select"
              className="input-field flex-1"
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
            >
              <option value="">Choose a new skill</option>
              {availableSkills.map(sk => (
                <option key={sk} value={sk}>{sk}</option>
              ))}
            </select>
            <button
              id="simulate-btn"
              className="btn-primary whitespace-nowrap"
              onClick={handleSimulate}
              disabled={!selectedSkill || loading}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              ) : (
                'Simulate →'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="animate-fade-in space-y-4 pt-2 border-t border-white/5">
            {/* Score comparison */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="glass p-4 rounded-xl space-y-1">
                <p className="section-label">Before</p>
                <p className="text-3xl font-bold font-mono text-slate-300">{result.before.toFixed(1)}<span className="text-lg">%</span></p>
                <p className="text-xs text-slate-500">Employability</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center space-y-1">
                  <div className={`text-2xl font-bold font-mono ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500">change</p>
                  <div className="text-xl">{delta > 0 ? '🚀' : delta < 0 ? '⬇' : '—'}</div>
                </div>
              </div>
              <div className="glass p-4 rounded-xl space-y-1 border border-emerald-500/20">
                <p className="section-label">After</p>
                <p className="text-3xl font-bold font-mono text-emerald-400">{result.after.toFixed(1)}<span className="text-lg">%</span></p>
                <p className="text-xs text-slate-500">Employability</p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Before</span><span className="font-mono">{result.before.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.before}%`, background: 'rgba(148,163,184,0.6)' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>After adding <strong className="text-white">{selectedSkill}</strong></span>
                  <span className="font-mono text-emerald-400">{result.after.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.after}%` }} />
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="glass p-4 rounded-xl space-y-2">
              <p className="section-label">Rule-based Explanation</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
              <p className="text-xs text-slate-500 italic">
                ⓘ This is a rule-based explainable layer — a stepping stone toward SHAP/LIME-based explanations once a trained model exists.
              </p>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="py-8 text-center text-slate-500 text-sm space-y-2">
            <div className="text-4xl">◈</div>
            <p>Select a skill above and click <strong className="text-slate-400">Simulate</strong> to see the impact.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Simulator
