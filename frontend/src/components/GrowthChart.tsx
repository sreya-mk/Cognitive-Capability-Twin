import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface SkillData {
  name: string
  category: string
  confidence: number
  growth: { '30': number; '90': number; '180': number }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong p-3 text-xs space-y-1">
        <p className="text-slate-300 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-mono font-medium">{p.value}%</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const COLORS = [
  '#00d2ac', '#00a8e8', '#7b61ff', '#f472b6', '#fb923c', '#34d399'
]

const GrowthChart: React.FC = () => {
  const [skills, setSkills] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get<SkillData[]>('/api/skills')
      .then(r => { setSkills(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Build chart data: one row per time horizon, one key per skill
  const horizons = ['Now', '30d', '90d', '180d']
  const chartData = horizons.map((h, i) => {
    const row: Record<string, any> = { day: h }
    skills.slice(0, 6).forEach(s => {
      if (i === 0) row[s.name] = Math.round(s.confidence)
      else if (i === 1) row[s.name] = s.growth['30']
      else if (i === 2) row[s.name] = s.growth['90']
      else row[s.name] = s.growth['180']
    })
    return row
  })

  const leverageScore = skills.length > 0 ? Math.min(96, Math.round(skills.slice(0, 4).reduce((acc, s) => acc + s.confidence, 0) / Math.max(skills.slice(0, 4).length, 1) + (skills.length * 2))) : 0
  const nextMilestone = skills.length > 0 ? skills[0].name : 'your first capability'

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Growth Projection</p>
          <h3 className="text-lg font-semibold text-slate-900">Skill Confidence Over Time</h3>
        </div>
        <span className="stat-badge stat-badge-purple">Logistic Heuristic</span>
      </div>

      {!loading && skills.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="section-label">Leverage score</p>
            <p className="text-2xl font-semibold text-slate-900">{leverageScore}</p>
            <p className="text-sm text-slate-600">How strongly your current skill set compounds across adjacent opportunities.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="section-label">Next milestone</p>
            <p className="text-sm font-semibold text-slate-900">{nextMilestone}</p>
            <p className="text-sm text-slate-600">A strong signal for your next high-leverage capability move.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Loading skill data…
        </div>
      ) : skills.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm">
          <span className="text-3xl">📊</span>
          No skills yet. Submit your profile first.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="day"
              stroke="rgba(148,163,184,0.5)"
              tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="rgba(148,163,184,0.5)"
              tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="rgba(0,210,172,0.2)" strokeDasharray="5 3" label={{ value: '80%', fill: 'rgba(0,210,172,0.5)', fontSize: 11 }} />
            {skills.slice(0, 6).map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {skills.length > 0 && (
        <div className="pt-2 border-t border-slate-200 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Future path:</span> your capability curve suggests a move toward deeper mastery in {nextMilestone}, which can unlock adjacent roles faster than isolated learning.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="section-label">Career path timeline</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Now: establish a strong base with {skills[0]?.name || 'your core capability'}.</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Next 90 days: turn momentum into proof via projects, portfolios, or demos.</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              <span>Next 180 days: expand into adjacent roles through complementary capability stacking.</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 6).map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GrowthChart
