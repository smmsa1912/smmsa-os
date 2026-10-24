import { useEffect, useRef, useState } from 'react'
import { useOS } from '../store'
import { generateLocalPortfolioAnswer, loadLocalPortfolioEngine, supportsLocalPortfolioAI, LOCAL_MODEL_ID } from '../localPortfolioAI'
import { buildLocalModelContext, buildQuickPortfolioAnswer, contextualizePortfolioQuestion, rankPortfolioKnowledge, resolveDirectPortfolioAnswer, resolvePortfolioNavigationCommand, shouldUseLocalPortfolioGeneration } from '../portfolioKnowledge'

// Capability is stable for the lifetime of this browser page; check it once at module load.
const WEBGPU_AVAILABLE = supportsLocalPortfolioAI()

const SUGGESTIONS = [
  'Give me a quick profile summary.',
  'Compare OSCAR and FinVerse.',
  'Which project best shows Agentic AI?',
  'What are FinVerse’s limitations?',
  'What can I ask you?',
]

function sourceLabel(source) {
  if (source.label) return source.label
  if (source.appTarget === 'projects') return 'Open case study'
  return source.title ?? 'Portfolio source'
}

function SourceLinks({ documents, onOpenApp }) {
  const links = documents.flatMap((document) => (document.sources ?? []).map((source) => ({ ...source, ownerTitle: document.title })))
  const uniqueLinks = [...new Map(links.map((source) => [`${source.label ?? source.appTarget ?? ''}|${source.href ?? ''}|${source.appTarget ?? ''}|${source.projectId ?? ''}`, source])).values()].slice(0, 6)
  if (!uniqueLinks.length) return null
  return (
    <div className="portfolio-ai-sources" aria-label="Related portfolio sources">
      <span>RELATED</span>
      {uniqueLinks.map((source, index) => source.href ? (
        <a key={`${source.href}-${index}`} href={source.href} target={source.href.startsWith('https://') ? '_blank' : undefined} rel={source.href.startsWith('https://') ? 'noopener noreferrer' : undefined}>{sourceLabel(source)} ↗</a>
      ) : (
        <button key={`${sourceLabel(source)}-${index}`} type="button" onClick={() => onOpenApp(source.appTarget, source.projectId)}>
          {sourceLabel(source)} <span aria-hidden="true">↗</span>
        </button>
      ))}
    </div>
  )
}

export default function PortfolioAssistant() {
  const messageSequence = useRef(0)
  const nextMessageId = () => `portfolio-ai-${++messageSequence.current}`
  const openApp = useOS((state) => state.openApp)
  const setSelectedProject = useOS((state) => state.setSelectedProject)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState(() => [{
    id: 'welcome-message',
    role: 'assistant',
    content: 'Hey! I’m Ask My Portfolio. Ask naturally about Andrew’s background, skills, experience, projects, research, results or limitations. You can compare projects, ask follow-ups, or say “open skills” to navigate the desktop. Quick answers work immediately; local AI is optional.',
    sources: [],
    mode: 'welcome',
  }])
  const [busy, setBusy] = useState(false)
  const [engine, setEngine] = useState(null)
  const [engineState, setEngineState] = useState('idle')
  const [useLocalAI, setUseLocalAI] = useState(false)
  const [loadProgress, setLoadProgress] = useState({ text: '', progress: 0 })
  const [engineError, setEngineError] = useState('')
  const [notice, setNotice] = useState('')
  const scroller = useRef(null)
  const inputRef = useRef(null)
  const webGpuAvailable = WEBGPU_AVAILABLE

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => () => {
    if (engine && typeof engine.unload === 'function') {
      const unloadResult = engine.unload()
      if (unloadResult && typeof unloadResult.catch === 'function') void unloadResult.catch(() => {})
    }
  }, [engine])

  const openSourceApp = (appTarget, projectId) => {
    if (!appTarget) return
    if (appTarget === 'projects' && projectId) setSelectedProject(projectId)
    openApp(appTarget)
  }

  const loadModel = async () => {
    if (engine || engineState === 'loading') return
    setEngineState('loading')
    setEngineError('')
    setNotice('')
    setLoadProgress({ text: 'Checking browser support…', progress: 0 })
    try {
      const localEngine = await loadLocalPortfolioEngine((report) => {
        setLoadProgress({
          text: report.text || 'Preparing the local model…',
          progress: Number.isFinite(report.progress) ? report.progress : 0,
        })
      })
      setEngine(localEngine)
      setUseLocalAI(true)
      setEngineState('ready')
      setLoadProgress({ text: 'Model ready and running locally.', progress: 100 })
      setNotice('Local AI is ready. Your questions and portfolio context are processed in this browser; no inference API is used.')
    } catch (error) {
      setEngineState('error')
      setEngineError(error instanceof Error ? error.message : 'Unable to load local AI.')
      setNotice('Quick Answers is still available without a model.')
    }
  }

  const ask = async (rawQuestion) => {
    const text = String(rawQuestion ?? '').trim()
    if (!text || busy) return
    if (text.length > 500) {
      setNotice('Please keep questions under 500 characters so the assistant can stay focused.')
      return
    }
    const userMessage = { id: nextMessageId(), role: 'user', content: text, sources: [] }
    setMessages((current) => [...current, userMessage])
    setQuestion('')
    setNotice('')

    const navigation = resolvePortfolioNavigationCommand(text)
    if (navigation) {
      openSourceApp(navigation.appTarget)
      setMessages((current) => [...current, {
        id: nextMessageId(),
        role: 'assistant',
        content: `Opening ${navigation.label}.`,
        sources: [],
        mode: 'quick',
      }])
      return
    }

    const contextualQuestion = contextualizePortfolioQuestion(text, messages)
    const directAnswer = resolveDirectPortfolioAnswer(contextualQuestion)
    const wantsLocalGeneration = Boolean(engine && useLocalAI && shouldUseLocalPortfolioGeneration(contextualQuestion))

    // Preserve deterministic answers for simple, verifiable facts. Let the local
    // model handle reasoning prompts and unknown conversational questions when enabled.
    if (directAnswer && !wantsLocalGeneration) {
      setMessages((current) => [...current, {
        id: nextMessageId(),
        role: 'assistant',
        content: directAnswer.answer,
        sources: directAnswer.sources ?? [],
        mode: 'quick',
      }])
      return
    }

    const matches = rankPortfolioKnowledge(contextualQuestion, 4)
    const fallback = buildQuickPortfolioAnswer(contextualQuestion)
    const hasStrongMatch = matches.length > 0 && matches[0].score >= 2
    // When local generation is selected, prefer the curated answer's source set
    // as well as retrieval matches. A broad query like “should I hire Andrew?”
    // may rank only the profile highly, while the actual judgment needs skills,
    // experience, and representative projects in the model context.
    const generationDocuments = [...(fallback.sources ?? []), ...matches]
    const uniqueGenerationDocuments = [...new Map(generationDocuments.map((document) => [document.id, document])).values()]
    const contextSources = wantsLocalGeneration
      ? uniqueGenerationDocuments
      : hasStrongMatch ? matches : fallback.sources ?? []
    const visibleSources = hasStrongMatch ? matches : []

    if (!engine || !useLocalAI) {
      setMessages((current) => [...current, {
        id: nextMessageId(),
        role: 'assistant',
        content: directAnswer?.answer ?? fallback.answer,
        sources: directAnswer?.sources ?? fallback.sources ?? [],
        mode: 'quick',
      }])
      return
    }

    setBusy(true)
    try {
      const context = buildLocalModelContext(contextSources)
      // Pass recent user turns for continuity, never prior model-generated claims.
      const recentHistory = messages
        .filter((message) => message.role === 'user')
        .slice(-3)
        .map((message) => ({ role: 'user', content: message.content }))
      const answer = await generateLocalPortfolioAnswer(engine, contextualQuestion, context, recentHistory)
      setMessages((current) => [...current, {
        id: nextMessageId(),
        role: 'assistant',
        content: answer,
        sources: visibleSources,
        mode: 'local',
      }])
    } catch (error) {
      setMessages((current) => [...current, {
        id: nextMessageId(),
        role: 'assistant',
        content: directAnswer?.answer ?? fallback.answer,
        sources: directAnswer?.sources ?? fallback.sources ?? [],
        mode: 'quick',
      }])
      setNotice(`Local AI had a problem, so I answered from the curated portfolio facts instead. ${error instanceof Error ? error.message : ''}`.trim())
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    ask(question)
  }

  return (
    <section className="portfolio-ai-app" aria-label="Ask My Portfolio assistant">
      <header className="portfolio-ai-header">
        <div className="portfolio-ai-title-lockup">
          <div className="portfolio-ai-mark" aria-hidden="true">AI</div>
          <div>
            <p className="portfolio-kicker">PRIVATE · PORTFOLIO-GROUNDED</p>
            <h2>Ask My Portfolio</h2>
            <p>Explore projects, architecture, research and experience.</p>
          </div>
        </div>
        <div className={`portfolio-ai-status ${engineState === 'ready' && useLocalAI ? 'is-local' : ''}`} role="status">
          <span aria-hidden="true" />
          {engineState === 'ready' && useLocalAI ? 'Local AI active' : 'Quick Answers ready'}
        </div>
      </header>

      <div className="portfolio-ai-mode-panel">
        <div className="portfolio-ai-mode-copy">
          <strong>{engineState === 'ready' ? (useLocalAI ? 'On-device model ready' : 'Local model downloaded') : 'No API key. No inference server.'}</strong>
          <span>
            {engineState === 'ready'
              ? 'Open-ended and reasoning questions use the local model. Greetings, navigation, and simple factual lookups are answered directly to keep them accurate.'
              : 'Quick Answers use Andrew’s curated project data immediately. Optional local AI needs WebGPU and downloads a model on first use; the browser may cache it for future visits.'}
          </span>
          <small>Model: {LOCAL_MODEL_ID} · Not fine-tuned on personal data; facts are retrieved at answer time. Runtime reference: <a href="https://github.com/mlc-ai/web-llm" target="_blank" rel="noopener noreferrer">WebLLM ↗</a></small>
        </div>
        <div className="portfolio-ai-mode-actions">
          {engineState === 'ready' ? (
            <button type="button" className={`portfolio-ai-mode-button${useLocalAI ? ' active' : ''}`} onClick={() => setUseLocalAI((current) => !current)}>
              {useLocalAI ? 'Use Quick Answers' : 'Use Local AI'}
            </button>
          ) : (
            <button type="button" className="portfolio-ai-mode-button" onClick={loadModel} disabled={!webGpuAvailable || engineState === 'loading'}>
              {engineState === 'loading' ? 'Loading model…' : 'Load local AI (optional)'}
            </button>
          )}
          {engineState === 'loading' && (
            <div className="portfolio-ai-progress" aria-live="polite">
              <div className="portfolio-ai-progress-track"><span style={{ width: `${Math.max(0, Math.min(100, loadProgress.progress))}%` }} /></div>
              <small>{loadProgress.text} {loadProgress.progress > 0 ? `${Math.round(loadProgress.progress)}%` : ''}</small>
            </div>
          )}
          {!webGpuAvailable && engineState !== 'ready' && (
            <small className="portfolio-ai-unavailable">WebGPU is unavailable here. Quick Answers still work.</small>
          )}
        </div>
      </div>

      {engineError && <div className="portfolio-ai-error" role="alert">{engineError}</div>}
      {notice && <div className="portfolio-ai-notice" role="status">{notice}</div>}

      <div className="portfolio-ai-chat" ref={scroller} aria-label="Conversation" aria-live="polite">
        {messages.map((message) => (
          <article className={`portfolio-ai-message ${message.role}`} key={message.id}>
            <span className="portfolio-ai-message-avatar" aria-hidden="true">{message.role === 'user' ? 'AN' : 'AI'}</span>
            <div className="portfolio-ai-message-main">
              <div className="portfolio-ai-message-meta">
                <strong>{message.role === 'user' ? 'You' : 'Portfolio Assistant'}</strong>
                {message.mode === 'local' && <span>LOCAL LLM</span>}
                {message.mode === 'quick' && <span>QUICK ANSWER</span>}
              </div>
              <div className="portfolio-ai-bubble">{message.content}</div>
              {message.sources?.length > 0 && <SourceLinks documents={message.sources} onOpenApp={openSourceApp} />}
            </div>
          </article>
        ))}
        {busy && <div className="portfolio-ai-thinking" role="status"><span className="portfolio-ai-thinking-dot" /> Local model is thinking…</div>}
      </div>

      {messages.length >= 1 && (
        <div className="portfolio-ai-suggestions" aria-label="Suggested questions">
          <p className="portfolio-kicker">TRY ASKING</p>
          {SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => ask(suggestion)}>{suggestion}<span aria-hidden="true">↗</span></button>)}
        </div>
      )}

      <form className="portfolio-ai-composer" onSubmit={handleSubmit}>
        <label htmlFor="portfolio-ai-question">Your question</label>
        <div className="portfolio-ai-composer-row">
          <input
            id="portfolio-ai-question"
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask naturally, e.g. “compare OSCAR and FinVerse”…"
            maxLength={500}
            autoComplete="off"
            disabled={busy}
          />
          <button type="submit" disabled={!question.trim() || busy}>Ask <span aria-hidden="true">↗</span></button>
        </div>
        <small>Answers are based on the portfolio data. Verify important details in the linked case studies.</small>
      </form>
    </section>
  )
}
