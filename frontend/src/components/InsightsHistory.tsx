import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface InsightSkill {
  name: string
  reason: string
}

interface InsightRole {
  role: string
  match_pct: number
  matched: string[]
  missing: string[]
}

interface SavedInsight {
  id: number
  created_at: string
  focus_area: string
  rationale: string
  recommended_roles: InsightRole[]
  suggested_skills: InsightSkill[]
}

const InsightsHistory: React.FC = () => {
  const [history, setHistory] = useState<SavedInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/insights/history')
        setHistory(response.data)
      } catch {
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="glass p-6 rounded-2xl">
        <p className="text-sm text-slate-600">Loading insights history…</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="glass p-6 rounded-2xl">
        <p className="text-sm text-slate-600">No saved insights yet. Submit a profile and save recommendations to build a history.</p>
      </div>
    )
  }

  const selectedInsight = history.find(i => i.id === selectedId) || history[0]

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="section-label">Tracking progress</p>
            <h3 className="text-xl font-semibold text-slate-900">Insights timeline</h3>
          </div>
          <span className="stat-badge stat-badge-blue">{history.length} snapshots</span>
        </div>

        {/* Timeline list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((insight, idx) => (
            <button
              key={insight.id}
              onClick={() => setSelectedId(insight.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selectedId === insight.id
                  ? 'border-slate-400 bg-slate-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(insight.created_at)}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{insight.focus_area}</p>
                </div>
                <span className="text-xs text-slate-500 px-2 py-1 rounded bg-slate-100">
                  {insight.recommended_roles.length} roles
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail view */}
      {selectedInsight && (
        <div className="glass p-6 rounded-2xl">
          <div className="mb-4">
            <p className="section-label">Selected insight</p>
            <p className="text-xs text-slate-500 mt-1">{formatDate(selectedInsight.created_at)}</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{selectedInsight.focus_area}</p>
              <p className="text-sm text-slate-600 mt-2 leading-7">{selectedInsight.rationale}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="section-label">Recommended roles</p>
                <div className="mt-3 space-y-2">
                  {selectedInsight.recommended_roles.slice(0, 3).map(role => (
                    <div key={role.role} className="rounded-lg border border-slate-200 p-2">
                      <p className="text-sm font-semibold text-slate-900">{role.role}</p>
                      <p className="text-sm text-slate-600 mt-1">{role.match_pct}% fit</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="section-label">Suggested skills</p>
                <div className="mt-3 space-y-2">
                  {selectedInsight.suggested_skills.slice(0, 3).map(skill => (
                    <div key={skill.name} className="rounded-lg border border-slate-200 p-2">
                      <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InsightsHistory
