import React, { useEffect, useState } from 'react'
import axios from 'axios'

function ProfileForm({ onOpenPrivacy }: { onOpenPrivacy?: () => void }) {
  const [rawText, setRawText] = useState('')
  const [hours, setHours] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [education, setEducation] = useState('')
  const [industries, setIndustries] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [availability, setAvailability] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get('/api/profile').then(({ data }) => {
      if (!data) return
      setRawText(data.raw_text || '')
      setHours(data.study_hours_per_week?.toString() || '')
      setRole(data.current_role || '')
      setGoal(data.career_goal || '')
      setName(data.full_name || '')
      setEmail(data.email || '')
      setLocation(data.location || '')
      setExperience(data.years_experience?.toString() || '')
      setEducation(data.education || '')
      setIndustries(data.industries || '')
      setGithub(data.github_url || '')
      setLinkedin(data.linkedin_url || '')
      setPortfolio(data.portfolio_url || '')
      setWorkMode(data.preferred_work_mode || '')
      setAvailability(data.availability || '')
      setTargetCompany(data.target_company || '')
    }).catch(() => undefined)
  }, [])

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
        full_name: name || undefined,
        email: email || undefined,
        location: location || undefined,
        years_experience: experience ? parseFloat(experience) : undefined,
        education: education || undefined,
        industries: industries || undefined,
        github_url: github || undefined,
        linkedin_url: linkedin || undefined,
        portfolio_url: portfolio || undefined,
        preferred_work_mode: workMode || undefined,
        availability: availability || undefined,
        target_company: targetCompany || undefined,
      })
      setStatus('success')
      setMessage('Profile processed! Head to the Dashboard to see your skills.')
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { current_role: role, career_goal: goal },
      }))
    } catch (err) {
      setStatus('error')
      setMessage('Error submitting profile. Is the backend running?')
    }
  }

  const sampleText = `I'm a software engineer with 3 years of experience. I work primarily with Python for data pipelines and machine learning experiments using scikit-learn and PyTorch. I have strong experience with Docker and Kubernetes for deploying services, and I use Git daily. I'm comfortable with SQL for data querying, and I've built REST APIs with FastAPI. I'm studying Deep Learning and NLP in my spare time.`

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 glass p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Profile Input</h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
              Paste your resume, GitHub project descriptions, and a short “about me”. The platform will extract your strengths, map them to a growth model, and help you plan next steps.
            </p>
          </div>
          <span className="stat-badge stat-badge-purple">AI-assisted analysis</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl space-y-7">
        <div>
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <p className="section-label">01 · Identity</p>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">Make the twin yours</h3>
            </div>
            <span className="text-xs text-slate-500">Private workspace</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2"><label className="section-label">Full Name</label><input className="input-field" placeholder="e.g. Sreya Nayuktha" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Email</label><input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Location</label><input className="input-field" placeholder="e.g. Bengaluru, India" value={location} onChange={e => setLocation(e.target.value)} /></div>
          </div>
        </div>

        <div>
          <div className="mb-3"><p className="section-label">02 · Positioning</p><h3 className="text-lg font-semibold text-slate-900 mt-1">Where are you headed?</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-2"><label className="section-label">Current Role</label><input id="current-role" className="input-field" placeholder="Software Engineer" value={role} onChange={e => setRole(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Target Role</label><input id="career-goal" className="input-field" placeholder="AI Engineer" value={goal} onChange={e => setGoal(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Years Experience</label><input type="number" min="0" max="80" step="0.5" className="input-field" placeholder="e.g. 3" value={experience} onChange={e => setExperience(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Study Hours / Week</label><input id="study-hours" type="number" className="input-field" placeholder="e.g. 10" value={hours} onChange={e => setHours(e.target.value)} min={0} max={168} required /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="space-y-2"><label className="section-label">Education</label><input className="input-field" placeholder="Degree, certification, or current study" value={education} onChange={e => setEducation(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Industries of Interest</label><input className="input-field" placeholder="e.g. Fintech, healthcare, climate" value={industries} onChange={e => setIndustries(e.target.value)} /></div>
          </div>
        </div>
        {/* Text area */}
        <div className="space-y-2">
          <div className="mb-1"><p className="section-label">03 · Narrative</p><label className="section-label">Profile Text</label></div>
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
                className="absolute bottom-3 right-3 text-xs px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Use sample →
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3"><p className="section-label">04 · Signals</p><h3 className="text-lg font-semibold text-slate-900 mt-1">Add context recruiters and mentors can understand</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2"><label className="section-label">GitHub</label><input type="url" className="input-field" placeholder="https://github.com/..." value={github} onChange={e => setGithub(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">LinkedIn</label><input type="url" className="input-field" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Portfolio</label><input type="url" className="input-field" placeholder="https://yourportfolio.com" value={portfolio} onChange={e => setPortfolio(e.target.value)} /></div>
            <div className="space-y-2"><label className="section-label">Work Mode</label><select className="input-field" value={workMode} onChange={e => setWorkMode(e.target.value)}><option value="">Select preference</option><option>Remote</option><option>Hybrid</option><option>On-site</option><option>Flexible</option></select></div>
            <div className="space-y-2"><label className="section-label">Availability</label><select className="input-field" value={availability} onChange={e => setAvailability(e.target.value)}><option value="">Select timing</option><option>Open to opportunities</option><option>Actively interviewing</option><option>Exploring quietly</option><option>Not looking right now</option></select></div>
            <div className="space-y-2"><label className="section-label">Target Company</label><input className="input-field" placeholder="Optional company or team" value={targetCompany} onChange={e => setTargetCompany(e.target.value)} /></div>
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
            <p className={`text-sm ${status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-red-600' : 'text-slate-600'}`}>
              {message}
            </p>
          )}
        </div>
      </form>

      {/* Recommendation card */}
      <div className="mt-6 glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label">Recommended next moves</p>
            <h3 className="text-lg font-semibold text-slate-900">Personal learning path</h3>
          </div>
          <span className="stat-badge stat-badge-blue">Adaptive</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-900">Deepen</p>
            <p className="text-sm text-slate-600 mt-1">Focus on a capability that increases leverage across your target roles.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-900">Show proof</p>
            <p className="text-sm text-slate-600 mt-1">Turn your learning into visible artifacts and portfolio evidence.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-900">Expand reach</p>
            <p className="text-sm text-slate-600 mt-1">Bridge into adjacent roles with one complementary capability.</p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="mt-6 glass p-5 space-y-3">
        <p className="section-label">How it works</p>
        <div className="space-y-2 text-sm text-slate-600">
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

      <button type="button" onClick={onOpenPrivacy} className="mt-6 glass block w-full p-5 text-left transition hover:border-teal-300 hover:shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Account &amp; privacy</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-1">Your profile data stays with this workspace</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-6">
              Profile details and extracted skills are stored by the FastAPI backend in a local SQLite database. The default file is <span className="font-mono text-xs text-slate-800">backend/app.db</span>; set <span className="font-mono text-xs text-slate-800">DB_PATH</span> to use another location.
            </p>
          </div>
          <span className="stat-badge stat-badge-green">Local storage</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-900">Profile</p><p className="text-xs text-slate-500 mt-1">Saved in user_profile</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-900">Skills</p><p className="text-xs text-slate-500 mt-1">Saved in skills</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-900">Insights</p><p className="text-xs text-slate-500 mt-1">Saved in insight_records</p></div>
        </div>
      </button>
    </div>
  )
}

export default ProfileForm
