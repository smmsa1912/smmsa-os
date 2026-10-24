// The model runtime is intentionally loaded only when the visitor opts in.
// This keeps WebLLM and its large runtime out of the normal Vite bundle.
export const LOCAL_MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
const WEBLLM_CDN_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.84'

export function supportsLocalPortfolioAI() {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && typeof navigator !== 'undefined'
    && 'gpu' in navigator
    && Boolean(navigator.gpu)
}

export async function loadLocalPortfolioEngine(onProgress = () => {}) {
  if (!supportsLocalPortfolioAI()) {
    throw new Error('Local AI needs a secure page and a browser with WebGPU. Quick answers do not need WebGPU.')
  }

  onProgress({ text: 'Loading the local AI runtime…', progress: 0 })
  // WebLLM is fetched from its published CDN at opt-in time only. It is not part
  // of the site bundle and no inference API key or provider endpoint is used.
  const webllm = await import(/* @vite-ignore */ WEBLLM_CDN_URL)
  if (typeof webllm.CreateMLCEngine !== 'function') {
    throw new Error('The local AI runtime loaded without its engine factory. Please retry or use Quick Answers.')
  }

  const engine = await webllm.CreateMLCEngine(LOCAL_MODEL_ID, {
    initProgressCallback: (report) => {
      const progress = Number.isFinite(report?.progress) ? Math.round(report.progress * 100) : undefined
      onProgress({ text: report?.text || report?.stage || 'Preparing model…', progress })
    },
  })
  return engine
}

export async function generateLocalPortfolioAnswer(engine, question, context, history = []) {
  if (!engine?.chat?.completions?.create) throw new Error('Local AI is not ready.')
  const messages = [
    {
      role: 'system',
      content: [
        'You are Ask My Portfolio, a private, on-device guide to Andrew Neil’s developer portfolio.',
        'For questions about Andrew or his projects, use the supplied PORTFOLIO FACTS as the source of truth. You may summarize, compare, explain, critique, and make clearly labeled recommendations from those facts, but do not invent repositories, demos, test counts, metrics, security properties, or deployment status.',
        'Clearly distinguish prototypes and simulations from production systems. Treat TradeAssist figures as historical backtest results, not live profits.',
        'You may also answer ordinary conversation and general programming, AI, or technology questions using general knowledge. Clearly distinguish general explanations from claims about Andrew’s portfolio. If a question needs facts not supplied here, say what is unknown rather than guessing. Do not pretend to know private information or details outside this portfolio.',
        'For names, email addresses, and contact links, return the exact value shown in PORTFOLIO FACTS. Never replace a known email address with a generic explanation.',
        'Do not invent social accounts or contact methods such as Twitter or Facebook unless those exact links appear in PORTFOLIO FACTS.',
        'Write a concise, friendly, direct answer. Understand casual phrasing, typos, and follow-up questions. Use short bullets when they improve readability. For comparisons, explain meaningful differences; for recommendations, state the criterion. Do not claim to have browsed the web or inspected code beyond the supplied facts.',
        '',
        'PORTFOLIO FACTS:',
        context || 'No matching portfolio facts were retrieved.',
      ].join('\n'),
    },
    ...history.slice(-4).map((message) => ({ role: message.role, content: message.content })),
    { role: 'user', content: question },
  ]
  const result = await engine.chat.completions.create({
    messages,
    temperature: 0.15,
    max_tokens: 320,
  })
  const answer = result?.choices?.[0]?.message?.content
  if (typeof answer !== 'string' || !answer.trim()) throw new Error('The local model returned an empty answer.')
  return answer.trim()
}
