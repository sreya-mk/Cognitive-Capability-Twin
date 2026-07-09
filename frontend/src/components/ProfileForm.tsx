import React, { useState } from 'react'
import axios from 'axios'

function ProfileForm() {
  const [rawText, setRawText] = useState('')
  const [hours, setHours] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('Extracting skills with AI...')
    try {
      await axios.post('/api/profile', {
        raw_text: rawText,
        study_hours_per_week: parseFloat(hours) || 0,
        current_role: role || undefined,
        career_goal: goal || undefined,
      })
      setStatus('success')
      setMessage('Profile processed! Head to the Dashboard to see your skills.')
    } catch (err) {
      setStatus('error')
      setMessage('Error submitting profile. Is the backend running?')
    }
  }

  const sampleText = `I'm a software engineer with 3 years of experience. I work primarily with Python for data pipelines and machine learning experiments using scikit-learn and PyTorch. I have strong experience with Docker and Kubernetes for deploying services, and I use Git daily. I'm comfortable with SQL for data querying, and I've built REST APIs with FastAPI. I'm studying Deep Learning and NLP in my spare time.`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Profile Input</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Paste your resume, GitHub project descriptions, and a short "about me". The AI will extract your skills, 
          categorise them, and estimate confidence scores. No API key? A built-in demo set is used automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Text area */}
        <div className="space-y-2">
          <label className="section-label">Profile Text</label>
          <div className="relative">
            <textarea
              id="profile-text"
              className="input-field resize-none"
              rows={9}
              placeholder="Paste resume text, GitHub project descriptions, about me..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            {!rawText && (
              <button
                type="button"
                onClick={() => setRawText(sampleText)}
                className="absolute bottom-3 right-3 text-xs px-3 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Use sample →
              </button>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="section-label">Study Hours / Week</label>
            <input
              id="study-hours"
              type="number"
              className="input-field"
              placeholder="e.g. 10"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min={0}
              max={168}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="section-label">Current Role</label>
            <input
              id="current-role"
              type="text"
              className="input-field"
              placeholder="e.g. Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="section-label">Career Goal</label>
            <input
              id="career-goal"
              type="text"
              className="input-field"
              placeholder="e.g. AI Engineer"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-1">
          <button
            id="submit-profile-btn"
            type="submit"
            className="btn-primary"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Extract Skills'
            )}
          </button>

          {message && (
            <p className={`text-sm ${status === 'success' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
              {message}
            </p>
          )}
        </div>
      </form>

      {/* Info card */}
      <div className="mt-8 glass p-5 space-y-3">
        <p className="section-label">How it works</p>
        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">①</span>
            <span>Your text is sent to an LLM (OpenAI / Anthropic) with a structured prompt requesting JSON skill output.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">②</span>
            <span>Each skill is stored in SQLite with a name, category, and confidence score (0–100).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">③</span>
            <span>A logistic growth formula projects your confidence at 30 / 90 / 180 days based on study hours and skill difficulty.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
