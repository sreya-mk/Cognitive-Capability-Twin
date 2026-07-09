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

interface InsightPayload {
  focus_area: string
  rationale: string
  recommended_roles: InsightRole[]
  suggested_skills: InsightSkill[]
}

const InsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<InsightPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.post('/api/insights', { current_role: '', career_goal: '' })
        setInsights(response.data)
      } catch {
        setInsights(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="glass p-6 rounded-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">New feature</p>
          <h3 className="text-xl font-semibold text-slate-900">Next-step intelligence</h3>
        </div>
        <span className="stat-badge stat-badge-purple">Adaptive guidance</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600 mt-4">Generating personalized guidance…</p>
      ) : !insights ? (
        <p className="text-sm text-slate-600 mt-4">Submit a profile to unlock personalized recommendations.</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{insights.focus_area}</p>
            <p className="text-sm text-slate-600 mt-2 leading-7">{insights.rationale}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="section-label">Suggested skills</p>
            <div className="mt-3 space-y-2">
              {insights.suggested_skills.map(skill => (
                <div key={skill.name} className="rounded-lg border border-slate-200 p-2">
                  <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                  <p className="text-xs text-slate-600">{skill.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {insights && insights.recommended_roles.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="section-label">Best-fit roles</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {insights.recommended_roles.slice(0, 3).map(role => (
              <div key={role.role} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{role.role}</p>
                <p className="text-sm text-slate-600 mt-1">{role.match_pct}% fit</p>
                <p className="text-xs text-slate-500 mt-2">Missing: {role.missing.join(', ') || 'None'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InsightsPanel
