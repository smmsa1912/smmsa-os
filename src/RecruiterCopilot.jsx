import { useState } from 'react'
import { buildQuickPortfolioAnswer } from './portfolioKnowledge'
import { matchRole } from './roleFit'

const questions = ['Explain OSCAR architecture', 'How does the research agent work?', 'What were TradeAssist’s results?', 'What are Andrew’s AI skills?', 'What roles suit Andrew?']

export default function RecruiterCopilot({ onProject, onNavigate }) {
  const [mode, setMode] = useState('questions')
  const [input, setInput] = useState('')
  const [description, setDescription] = useState('')
  const [answer, setAnswer] = useState(null)
  const [matches, setMatches] = useState(null)
  const ask = (question) => { setInput(question); setAnswer(buildQuickPortfolioAnswer(question)) }
  return <section className="recruiter-section recruiter-copilot" id="copilot" aria-labelledby="copilot-heading">
    <div className="recruiter-section-heading"><div><p className="recruiter-section-kicker">LOCAL-FIRST · EVIDENCE-GROUNDED</p><h2 id="copilot-heading">Recruiter copilot</h2></div><span className="recruiter-section-index">NO API KEY</span></div>
    <div className="copilot-box">
      <div className="copilot-tabs" aria-label="Copilot mode"><button type="button" aria-pressed={mode === 'questions'} onClick={() => setMode('questions')}>Ask the portfolio</button><button type="button" aria-pressed={mode === 'fit'} onClick={() => setMode('fit')}>Compare a job description</button></div>
      {mode === 'questions' ? <>
        <p>Explore documented project facts and technical experience using quick, curated answers.</p>
        <div className="copilot-prompts">{questions.map(question => <button type="button" key={question} onClick={() => ask(question)}>{question}</button>)}</div>
        <form className="copilot-form" onSubmit={event => { event.preventDefault(); if (input.trim()) ask(input.trim()) }}><label htmlFor="copilot-question">Your question</label><div><input id="copilot-question" value={input} onChange={event => setInput(event.target.value)} maxLength={1000} placeholder="Ask about projects, tools or experience…"/><button type="submit" disabled={!input.trim()}>Ask →</button></div></form>
        {answer && <div className="copilot-answer" aria-live="polite"><p>{answer.answer}</p>{answer.sources?.length > 0 && <div className="copilot-sources">{answer.sources.map(source => source.projectId ? <button type="button" key={source.id} onClick={() => onProject(source.projectId)}>{source.title} ↗</button> : onNavigate ? <button type="button" key={source.id} onClick={() => onNavigate(source.type === 'publication' ? 'papers' : source.type === 'skills' ? 'skills' : source.type === 'experience' ? 'about' : 'recruiter')}>{source.title} ↗</button> : <a key={source.id} href={source.type === 'publication' ? source.sources?.find(item => item.href)?.href || '#research' : source.type === 'skills' ? '#skills' : source.type === 'experience' ? '#experience' : '#top'}>{source.title} ↗</a>)}</div>}</div>}
      </> : <>
        <p>Paste a job description to identify documented capability matches and acknowledged gaps. The comparison is keyword-based, not a hiring decision.</p>
        <form className="copilot-form" onSubmit={event => { event.preventDefault(); setMatches(matchRole(description)) }}><label htmlFor="copilot-role">Job description</label><textarea id="copilot-role" value={description} onChange={event => { setDescription(event.target.value); setMatches(null) }} maxLength={12000} rows={6} placeholder="Paste the technical requirements here…"/><button type="submit" disabled={!description.trim()}>Compare evidence →</button></form>
        {matches && <div className="copilot-answer" aria-live="polite">{matches.length ? matches.map(item => <article className="fit-item" key={item.label}><strong>{item.label}</strong><span className={item.gap ? 'fit-gap' : 'fit-match'}>{item.gap ? 'Evidence gap' : 'Relevant evidence'}</span><p>{item.evidence}</p>{item.project && <button type="button" onClick={() => onProject(item.project)}>Inspect project ↗</button>}</article>) : <p>No explicit match found. Review the resume and case studies for additional context.</p>}</div>}
      </>}
      <small>Inputs stay in this browser. Quick answers use curated portfolio data; optional WebGPU local inference is available in Ask My Portfolio.</small>
    </div>
  </section>
}
