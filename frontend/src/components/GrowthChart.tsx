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

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Growth Projection</p>
          <h3 className="text-lg font-semibold text-white">Skill Confidence Over Time</h3>
        </div>
        <span className="stat-badge stat-badge-purple">Logistic Heuristic</span>
      </div>

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
        <div className="pt-2 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 6).map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-400">
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
