import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { appMeta } from '../src/appMeta.js'
import { ICONS } from '../src/components/icons.js'
import { buildLocalModelContext, buildQuickPortfolioAnswer, contextualizePortfolioQuestion, rankPortfolioKnowledge, resolveDirectPortfolioAnswer, resolvePortfolioNavigationCommand, shouldUseLocalPortfolioGeneration } from '../src/portfolioKnowledge.js'

const source = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Ask My Portfolio is registered as a real desktop app', async () => {
  assert.equal(appMeta.assistant.title, 'Ask My Portfolio')
  assert.equal(appMeta.assistant.icon, 'brain')
  assert.ok(appMeta.assistant.w >= 760 && appMeta.assistant.h >= 600)
  const registry = await source('../src/apps/registry.js')
  const metadata = await source('../src/appMeta.js')
  const icons = await source('../src/components/icons.js')
  assert.match(registry, /assistant: PortfolioAssistant/)
  assert.match(metadata, /assistant: \{[^}]*icon: 'brain'/s)
  assert.match(icons, /brain: \[/)
  assert.equal(ICONS.brain.length, 12)
  assert.ok(ICONS.brain.every((row) => row.length === 12), 'brain icon must be a consistent 12x12 grid')
})

test('portfolio assistant knowledge search finds OSCAR architecture', () => {
  const matches = rankPortfolioKnowledge('How does OSCAR route a desktop task?', 4)
  assert.ok(matches.length)
  assert.equal(matches[0].projectId, 'oscar')
  assert.match(matches[0].body, /planner|orchestration|agent/i)
})

test('TradeAssist answers include the recorded backtest caveat', () => {
  const result = buildQuickPortfolioAnswer('What were TradeAssist backtest results?')
  assert.match(result.answer, /\+24\.17%/)
  assert.match(result.answer, /historical backtest/i)
  assert.match(result.answer, /not a claim of live profit|not live trading performance/i)
})

test('FinVerse answers preserve security and validation limitations', () => {
  const matches = rankPortfolioKnowledge('Explain FinVerse wallet architecture and limitations', 4)
  assert.equal(matches[0].projectId, 'finverse')
  assert.match(matches[0].body, /authentication mismatch/i)
  assert.match(matches[0].body, /default MIFARE Classic key/i)
  assert.match(matches[0].body, /synthetic/i)
})


test('quick answers distinguish agentic automation from the broader AI-fintech prototype', () => {
  const result = buildQuickPortfolioAnswer('Which projects demonstrate my Agentic AI experience?')
  assert.match(result.answer, /OSCAR is the clearest example/i)
  assert.match(result.answer, /rather than a documented general-purpose agent/i)
})

test('quick answers can respond without invoking any model runtime', () => {
  const result = buildQuickPortfolioAnswer('How can I contact Andrew?')
  assert.match(result.answer, /andrewneil1912@gmail\.com/)
  assert.match(result.answer, /github\.com\/smmsa1912/)
})

test('retrieved local model context contains only curated portfolio facts', () => {
  const matches = rankPortfolioKnowledge('OSCAR screenshots and browser automation', 3)
  const context = buildLocalModelContext(matches)
  assert.match(context, /SOURCE: OSCAR/)
  assert.match(context, /FACTS:/)
  assert.doesNotMatch(context, /sk-[A-Za-z0-9]{20,}|api[_ -]?key\s*[:=]/i)
})

test('local model context helper is imported from the knowledge module', async () => {
  const component = await source('../src/apps/PortfolioAssistant.jsx')
  const runtime = await source('../src/localPortfolioAI.js')
  const knowledge = await source('../src/portfolioKnowledge.js')
  assert.match(component, /import \{ buildLocalModelContext, buildQuickPortfolioAnswer, contextualizePortfolioQuestion, rankPortfolioKnowledge, resolveDirectPortfolioAnswer, resolvePortfolioNavigationCommand, shouldUseLocalPortfolioGeneration \} from '..\/portfolioKnowledge'/)
  assert.doesNotMatch(component, /buildLocalModelContext[^\n]*from '..\/localPortfolioAI'/)
  assert.match(knowledge, /export function buildLocalModelContext\(/)
  assert.doesNotMatch(runtime, /export function buildLocalModelContext\(/)
})

test('local model runtime is opt-in, dynamically loaded, and has no inference API config', async () => {
  const runtime = await source('../src/localPortfolioAI.js')
  const component = await source('../src/apps/PortfolioAssistant.jsx')
  assert.match(runtime, /import\(\/\* @vite-ignore \*\/ WEBLLM_CDN_URL\)/)
  assert.match(runtime, /Qwen2\.5-0\.5B-Instruct-q4f16_1-MLC/)
  assert.match(runtime, /https:\/\/esm\.run\/@mlc-ai\/web-llm@0\.2\.84/)
  assert.doesNotMatch(runtime, /api\.openai\.com|apiKey\s*:/i)
  assert.match(component, /Load local AI \(optional\)/)
  assert.match(component, /WebGPU/)
  assert.match(component, /quick answers/i)
})

test('assistant provides source links and keeps model loading explicitly user-triggered', async () => {
  const component = await source('../src/apps/PortfolioAssistant.jsx')
  const quickView = await source('../src/apps/QuickView.jsx')
  assert.match(component, /SourceLinks/)
  assert.match(component, /target="_blank" rel="noopener noreferrer"/)
  assert.match(component, /onClick=\{loadModel\}/)
  assert.match(quickView, /openApp\('assistant'\)/)
})


test('greetings and owner-name questions get deterministic friendly answers', () => {
  const greeting = buildQuickPortfolioAnswer('hiii')
  assert.match(greeting.answer, /Hey!/i)
  assert.match(greeting.answer, /Ask My Portfolio/)
  for (const question of ["what's my name?", 'whats my name?', "what's his name?", 'whats his name?', 'who is Andrew?']) {
    const result = resolveDirectPortfolioAnswer(question)
    assert.ok(result, `expected a direct answer for: ${question}`)
    assert.match(result.answer, /Andrew Neil/)
  }
})

test('email questions return the actual email address instead of generic text', () => {
  for (const question of ['whats my email address', 'his email id?', "what's his email?", 'email']) {
    const result = buildQuickPortfolioAnswer(question)
    assert.match(result.answer, /andrewneil1912@gmail\.com/)
    assert.doesNotMatch(result.answer, /primary contact information/i)
  }
})

test('contact answers only list verified contact channels', () => {
  const result = buildQuickPortfolioAnswer('how to contact Andrew?')
  assert.match(result.answer, /andrewneil1912@gmail\.com/)
  assert.match(result.answer, /linkedin\.com\/in\//)
  assert.doesNotMatch(result.answer, /Twitter|Facebook/i)
})

test('singular phrasing like “show me his project” returns the project list', () => {
  const result = resolveDirectPortfolioAnswer('show me his project')
  assert.match(result.answer, /projects documented in Andrew Neil's portfolio/i)
  assert.match(result.answer, /OSCAR/)
  assert.match(result.answer, /TradeAssist/)
})

test('retrieved profile facts include real contact details for optional local inference', () => {
  const matches = rankPortfolioKnowledge('what is Andrew email contact', 4)
  const context = buildLocalModelContext(matches)
  assert.match(context, /andrewneil1912@gmail\.com/)
  assert.match(context, /linkedin\.com\/in\//)
})

test('identity and contact intents bypass local model generation', async () => {
  const component = await source('../src/apps/PortfolioAssistant.jsx')
  assert.match(component, /const directAnswer = resolveDirectPortfolioAnswer\(contextualQuestion\)/)
  assert.match(component, /if \(directAnswer && !wantsLocalGeneration\) \{[\s\S]*?content: directAnswer\.answer[\s\S]*?return/)
  assert.match(component, /contextualizePortfolioQuestion\(text, messages\)/)
  assert.doesNotMatch(component, /generateLocalPortfolioAnswer\(engine, text, context, recentHistory\)/)
})


test('assistant help gives visitors a useful menu of things to ask', () => {
  const result = resolveDirectPortfolioAnswer('what can I ask you?')
  assert.ok(result)
  assert.match(result.answer, /Compare OSCAR and FinVerse/i)
  assert.match(result.answer, /skills, languages and frameworks/i)
  assert.match(result.answer, /roles fit/i)
})

test('basic small talk and gratitude are handled without the tiny local model', () => {
  assert.match(resolveDirectPortfolioAnswer('how are you?').answer, /here to help/i)
  assert.match(resolveDirectPortfolioAnswer('thanks!').answer, /You're welcome/i)
  assert.match(resolveDirectPortfolioAnswer('bye').answer, /See you/i)
})

test('portfolio summary, education and career-fit questions are directly answered', () => {
  assert.match(resolveDirectPortfolioAnswer('summarize Andrew').answer, /Computer Engineering student/i)
  assert.match(resolveDirectPortfolioAnswer('what is his CGPA?').answer, /7\.48\/10/i)
  assert.match(resolveDirectPortfolioAnswer('what roles suit Andrew?').answer, /agentic AI engineering/i)
  assert.match(resolveDirectPortfolioAnswer('what project won the competition?').answer, /Dynamic Toll Charging System/i)
})

test('common technology questions handle categories and project-specific stacks', () => {
  assert.match(resolveDirectPortfolioAnswer('what programming languages does he know?').answer, /Python, JavaScript\/TypeScript, SQL, C\/C\+\+/)
  assert.match(resolveDirectPortfolioAnswer('what is the tech stack of OSCAR?').answer, /Python, Flutter, Gemini/i)
  assert.match(resolveDirectPortfolioAnswer('what are Andrew’s AI skills?').answer, /AI and automation/i)
})

test('project questions can ask for limitations, architecture, and metrics', () => {
  const finverse = resolveDirectPortfolioAnswer('what are the limitations of FinVerse?')
  assert.match(finverse.answer, /Final-year prototype under development/i)
  assert.match(finverse.answer, /timestamped HMAC/i)
  const oscar = resolveDirectPortfolioAnswer('explain OSCAR architecture')
  assert.match(oscar.answer, /Workflow:/i)
  const tradeassist = resolveDirectPortfolioAnswer('what were TradeAssist’s results?')
  assert.match(tradeassist.answer, /\+24\.17%/)
  assert.match(tradeassist.answer, /historical backtest/i)
})

test('assistant can compare projects and explain best fit by criterion', () => {
  const comparison = resolveDirectPortfolioAnswer('compare OSCAR vs FinVerse')
  assert.match(comparison.answer, /Here’s a portfolio-grounded comparison/i)
  assert.match(comparison.answer, /Python, Flutter/i)
  assert.match(comparison.answer, /ESP32/i)
  const best = resolveDirectPortfolioAnswer('which project is best?')
  assert.match(best.answer, /depends on the role/i)
  assert.match(best.answer, /For Agentic AI/i)
})

test('portfolio navigation commands open desktop apps directly', () => {
  assert.deepEqual(resolvePortfolioNavigationCommand('open skills'), { appTarget: 'skills', label: 'Skills & Tools' })
  assert.deepEqual(resolvePortfolioNavigationCommand('please open my resume'), { appTarget: 'resume', label: 'Resume' })
  assert.deepEqual(resolvePortfolioNavigationCommand('go to publications'), { appTarget: 'papers', label: 'Publications' })
  assert.equal(resolvePortfolioNavigationCommand('show me resume PDF'), null)
})

test('follow-up questions inherit the last cited portfolio topic', () => {
  const oscarDoc = rankPortfolioKnowledge('OSCAR architecture', 1)[0]
  const followUp = contextualizePortfolioQuestion('what about its limitations?', [
    { role: 'assistant', content: 'OSCAR details', sources: [oscarDoc] },
  ])
  assert.match(followUp, /OSCAR/)
  const result = resolveDirectPortfolioAnswer(followUp)
  assert.match(result.answer, /Windows-first local automation prototype/i)
})

test('unverified project details remain scoped and the local prompt supports grounded comparisons', async () => {
  const runtime = await source('../src/localPortfolioAI.js')
  assert.match(runtime, /clearly labeled recommendations/i)
  assert.match(runtime, /Do not pretend to know private information/i)
  const answer = buildQuickPortfolioAnswer('explain FinVerse')
  assert.match(answer.answer, /not a production payment gateway|prototype/i)
})


test('portfolio navigation and generic site questions do not fall into accidental keyword matches', () => {
  assert.match(resolveDirectPortfolioAnswer('what are his projects').answer, /projects documented/i)
  assert.match(resolveDirectPortfolioAnswer('what is this website?').answer, /interactive developer portfolio/i)
  assert.match(resolveDirectPortfolioAnswer('what about its limitations?').answer, /Which project should I dig into/i)
  assert.match(buildQuickPortfolioAnswer('what is this website?').answer, /interactive developer portfolio/i)
})


test('casual typos and punctuation still identify the assistant correctly', () => {
  for (const question of ["soo whats ur name\\", "what's ur name?", 'who are you?', 'what model are you?']) {
    const result = resolveDirectPortfolioAnswer(question)
    assert.ok(result, `expected an identity answer for: ${question}`)
    assert.match(result.answer, /Ask My Portfolio/i)
  }
})

test('local generation is chosen for reasoning prompts, not simple fact lookups', () => {
  for (const question of [
    'Explain OSCAR architecture',
    'Compare OSCAR and FinVerse',
    'What do you think Andrew should improve?',
    'Write a 30-second portfolio pitch',
    'How could these projects be combined?',
    'What are the pros and cons of FinVerse?',
    'Should I hire Andrew?',
    'Should we hire Andrew as an Agentic AI engineer?',
    'Is Andrew a strong candidate for this role?',
    'Would Andrew be a good hire?',
  ]) {
    assert.equal(shouldUseLocalPortfolioGeneration(question), true, question)
  }
  for (const question of ['What is Andrew’s name?', 'What is his email?', 'What is his CGPA?', 'Open skills']) {
    assert.equal(shouldUseLocalPortfolioGeneration(question), false, question)
  }
})


test('local reasoning context combines deterministic answer sources with retrieval matches', async () => {
  const component = await source('../src/apps/PortfolioAssistant.jsx')
  const knowledge = await source('../src/portfolioKnowledge.js')
  assert.ok(component.includes('const generationDocuments = [...(fallback.sources ?? []), ...matches]'))
  assert.match(component, /const contextSources = wantsLocalGeneration/)
  assert.match(knowledge, /asksHiringJudgement/)
  const direct = resolveDirectPortfolioAnswer('Should I hire Andrew?')
  assert.ok(direct, 'quick-answer fallback should still be available if inference fails')
  assert.ok(direct.sources.some((item) => item.id === 'experience'))
  assert.ok(direct.sources.some((item) => item.id === 'skills'))
  assert.equal(shouldUseLocalPortfolioGeneration('Should I hire Andrew?'), true)
})

test('local mode routes open-ended and unmatched questions to the model without requiring a strong retrieval score', async () => {
  const component = await source('../src/apps/PortfolioAssistant.jsx')
  assert.match(component, /const wantsLocalGeneration = Boolean\(engine && useLocalAI && shouldUseLocalPortfolioGeneration\(contextualQuestion\)\)/)
  assert.match(component, /if \(!engine \|\| !useLocalAI\)/)
  assert.match(component, /generateLocalPortfolioAnswer\(engine, contextualQuestion, context, recentHistory\)/)
  assert.doesNotMatch(component, /if \(!engine \|\| !useLocalAI \|\| !hasStrongMatch\)/)
  assert.match(component, /QUICK ANSWER/)
})

test('local model can answer general technology questions while keeping portfolio claims grounded', async () => {
  const runtime = await source('../src/localPortfolioAI.js')
  assert.match(runtime, /ordinary conversation and general programming, AI, or technology questions/)
  assert.match(runtime, /Clearly distinguish general explanations from claims about Andrew/)
})
