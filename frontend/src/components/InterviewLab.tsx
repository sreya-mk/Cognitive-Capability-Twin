import React, { useState } from 'react'
import axios from 'axios'

interface InterviewQuestion {
  question: string
  intent: string
  answer_framework: string
  evidence_prompt: string
}

interface InterviewSet {
  role: string
  intro: string
  questions: InterviewQuestion[]
  mode: string
}

const InterviewLab: React.FC = () => {
  const [interview, setInterview] = useState<InterviewSet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeQuestion, setActiveQuestion] = useState(0)

  const generateInterview = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post<InterviewSet>('/api/interview')
      setInterview(response.data)
      setActiveQuestion(0)
    } catch {
      setError('The Interview Lab could not load. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const current = interview?.questions[activeQuestion]

  return (
    <section className="interview-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="interview-kicker">AI Interview Lab</span>
            <span className="stat-badge stat-badge-blue">Practice mode</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Prepare with questions shaped around your target role.</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Get realistic questions, a simple answer structure, and the evidence your response should include.</p>
        </div>
        <button type="button" className="btn-primary" onClick={generateInterview} disabled={loading}>
          {loading ? 'Preparing...' : interview ? 'Regenerate set' : 'Start practice'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {loading && <div className="mt-5 h-40 animate-pulse rounded-2xl bg-white/60" />}

      {!interview && !loading && !error && (
        <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="interview-chip">Role readiness</span>
          <span className="interview-chip">Project evidence</span>
          <span className="interview-chip">Communication signal</span>
        </div>
      )}

      {interview && !loading && current && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.3fr_0.7fr]">
          <div>
            <p className="section-label">{interview.role} · {interview.mode}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{interview.intro}</p>
            <div className="mt-4 space-y-2">
              {interview.questions.map((question, index) => (
                <button key={question.question} type="button" onClick={() => setActiveQuestion(index)} className={`interview-question-nav ${activeQuestion === index ? 'interview-question-active' : ''}`}>
                  <span>0{index + 1}</span><span>{question.question}</span>
                </button>
              ))}
            </div>
          </div>
          <article className="rounded-2xl border border-white/80 bg-white/80 p-5">
            <div className="flex items-center justify-between gap-3"><span className="interview-number">Question 0{activeQuestion + 1}</span><span className="text-xs text-slate-500">{activeQuestion + 1} / {interview.questions.length}</span></div>
            <h4 className="mt-4 text-xl font-semibold leading-8 text-slate-950">{current.question}</h4>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="interview-detail"><p className="section-label">What it tests</p><p>{current.intent}</p></div>
              <div className="interview-detail"><p className="section-label">Answer shape</p><p>{current.answer_framework}</p></div>
              <div className="interview-detail"><p className="section-label">Bring evidence</p><p>{current.evidence_prompt}</p></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="interview-nav-button" onClick={() => setActiveQuestion(Math.max(0, activeQuestion - 1))} disabled={activeQuestion === 0}>Previous</button>
              <button type="button" className="interview-nav-button interview-nav-primary" onClick={() => setActiveQuestion(Math.min(interview.questions.length - 1, activeQuestion + 1))} disabled={activeQuestion === interview.questions.length - 1}>Next question</button>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

export default InterviewLab
