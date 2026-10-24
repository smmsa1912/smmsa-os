import { profile, projects, publications, skills, highlights, experience, education } from './data.js'

const STOP_WORDS = new Set([
  'a', 'about', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been', 'but',
  'can', 'could', 'did', 'do', 'does', 'explain', 'for', 'from', 'get', 'give', 'has', 'have',
  'he', 'her', 'here', 'how', 'i', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'of', 'on',
  'or', 'our', 'please', 'show', 'some', 'tell', 'that', 'the', 'their', 'them', 'there', 'these',
  'this', 'to', 'was', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'would', 'you', 'your',
])

const words = (value) => String(value ?? '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9.+#-]+/g, ' ')
  .split(/\s+/)
  .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

const formatProjectBody = (project) => {
  const sections = [
    `${project.name}: ${project.summary}`,
    `Project type: ${project.kind}.`,
    `Technology stack: ${project.stack.join(', ')}.`,
    `Implementation details: ${project.points.join(' ')}`,
    project.metrics?.length ? `Recorded metrics: ${project.metrics.map((metric) => `${metric.label}: ${metric.value}`).join('; ')}. ${project.metricsNote ?? ''}` : '',
    project.scopeNote ? `Scope and limitations: ${project.scopeNote}` : '',
    project.implementationCaveats?.length ? `Implementation caveats: ${project.implementationCaveats.join(' ')}` : '',
    project.workflow?.length ? `Workflow: ${project.workflow.map((step) => `${step.title}: ${step.detail}`).join(' ')}` : '',
    project.repo ? `Public repository: ${project.repo}` : '',
  ]
  return sections.filter(Boolean).join('\n')
}

const projectDocs = projects.map((project) => ({
  id: `project-${project.id}`,
  type: 'project',
  title: project.name,
  category: 'Project case study',
  body: formatProjectBody(project),
  appTarget: 'projects',
  projectId: project.id,
  tags: [...project.tags, ...project.stack, project.id],
  sources: [
    { label: 'Open case study', appTarget: 'projects', projectId: project.id },
    ...(project.repo ? [{ label: 'GitHub repository', href: project.repo }] : []),
    ...(project.paperIds ?? []).map((paperId) => publications.find((paper) => paper.id === paperId)).filter(Boolean).map((paper) => ({ label: paper.title, href: paper.href })),
  ],
}))

const profileDoc = {
  id: 'profile',
  type: 'profile',
  title: `About ${profile.name}`,
  category: 'Profile',
  body: `${profile.name} is a ${profile.role} at ${profile.school}, graduating in ${profile.grad}. Focus: ${profile.tagline} ${profile.bio.join(' ')} Contact details: email ${profile.email}; GitHub ${profile.github}; LinkedIn ${profile.linkedin || 'not listed'}; resume ${profile.resume}. Education: ${education.degree}, ${education.school}, ${education.when}, CGPA ${education.cgpa}. Highlights: ${highlights.join(' ')}`,
  tags: ['profile', 'about', 'education', 'background', 'andrew', 'neil', 'career', 'bio'],
  sources: [
    { label: 'About me', appTarget: 'about' },
    { label: 'Resume PDF', href: profile.resume },
    { label: 'Email Andrew', href: `mailto:${profile.email}` },
    { label: 'GitHub profile', href: profile.github },
    ...(profile.linkedin ? [{ label: 'LinkedIn profile', href: profile.linkedin }] : []),
  ],
}

const experienceDoc = {
  id: 'experience',
  type: 'experience',
  title: 'Experience',
  category: 'Experience',
  body: experience.map((item) => `${item.role} at ${item.org} (${item.when}). Technologies: ${item.tech.join(', ')}. ${item.points.join(' ')}`).join('\n'),
  tags: ['internship', 'job', 'work', 'experience', 'freelance', '41studio', 'upwork', 'backend'],
  sources: [{ label: 'Resume', href: profile.resume }, { label: 'About me', appTarget: 'about' }],
}

const skillsDoc = {
  id: 'skills',
  type: 'skills',
  title: 'Skills and tools',
  category: 'Technical skills',
  body: Object.entries(skills).map(([group, items]) => `${group}: ${items.join(', ')}`).join('\n'),
  tags: ['skills', 'technology', 'technologies', 'tools', 'stack', 'programming', 'frameworks', 'languages'],
  sources: [{ label: 'Skills & Tools', appTarget: 'skills' }],
}

const publicationDocs = publications.map((paper) => ({
  id: `paper-${paper.id}`,
  type: 'publication',
  title: paper.title,
  category: 'Publication',
  body: `${paper.title}. ${paper.where}. ${paper.summary} Topics: ${paper.topics.join(', ')}.`,
  tags: [...paper.topics, 'paper', 'publication', 'research', paper.id],
  sources: [{ label: 'Read paper', href: paper.href }, { label: 'Publications window', appTarget: 'papers' }],
}))

export const PORTFOLIO_KNOWLEDGE = [profileDoc, experienceDoc, skillsDoc, ...projectDocs, ...publicationDocs]

const expandSynonyms = (query) => {
  const tokens = words(query)
  const aliases = [
    [/\b(oscar|desktop agent|browser agent|ui agent|terminal agent|computer use)\b/i, 'oscar automation browser desktop terminal agent planner orchestration screenshot vision'],
    [/\b(tradeassist|trading|backtest|backtesting|drawdown|cagr|irfc|quant)\b/i, 'tradeassist quantitative strategy market-data signals slippage brokerage backtest drawdown cagr irfc'],
    [/\b(finverse|wallet|payment|nfc|blockchain|pos intent)\b/i, 'finverse wallet payment nfc blockchain pos transaction xgboost django esp32'],
    [/\b(toll|number plate|anpr|yolo|fastag)\b/i, 'toll system yolo opencv anpr ocr rfid vehicle detection'],
    [/\b(kyc|smart card|document verification|digilocker)\b/i, 'kyc smartcard rfid bluetooth jwt django document verification'],
    [/\b(resume|cv|contact|email|linkedin|github)\b/i, 'profile contact email linkedin github resume'],
  ]
  let expanded = tokens.join(' ')
  for (const [pattern, replacement] of aliases) {
    if (pattern.test(query)) expanded += ` ${replacement}`
  }
  return [...new Set(words(expanded))]
}

export function rankPortfolioKnowledge(query, limit = 4) {
  const queryText = String(query ?? '').trim()
  if (!queryText) return []
  const queryTokens = expandSynonyms(queryText)
  const querySet = new Set(queryTokens)
  const normalizedQuery = queryText.toLowerCase()
  const directProjectIds = projects.filter((project) => normalizedQuery.includes(project.name.toLowerCase()) || normalizedQuery.includes(project.id.replaceAll('-', ' ')))

  const ranked = PORTFOLIO_KNOWLEDGE.map((item) => {
    const titleTokens = new Set(words(`${item.title} ${item.id} ${item.tags.join(' ')}`))
    const bodyTokens = new Set(words(item.body))
    let score = 0
    for (const token of querySet) {
      if (titleTokens.has(token)) score += 4
      else if (bodyTokens.has(token)) score += 1
    }
    if (item.type === 'project' && directProjectIds.some((project) => item.projectId === project.id)) score += 20
    if (item.type === 'publication' && /paper|publication|published|research|journal/i.test(queryText)) score += 4
    if (item.type === 'skills' && /skill|technology|tech stack|tools|framework/i.test(queryText)) score += 8
    if (item.type === 'experience' && /experience|intern|job|work history|freelance/i.test(queryText)) score += 8
    if (item.type === 'profile' && /about|who am i|who is andrew|your name|background|education|graduat/i.test(queryText)) score += 8
    return { ...item, score }
  }).filter((item) => item.score > 0)

  ranked.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  return ranked.slice(0, limit)
}

const bullets = (items) => items.map((item) => `• ${item}`).join('\n')
const normalizeQuestion = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[’‘]/g, "'")
  .replace(/\\/g, ' ')
  .replace(/\b(?:ur)\b/g, 'your')
  .replace(/\b(?:u)\b/g, 'you')
  .replace(/\bsoo+\b/g, 'so')
  .replace(/[^a-z0-9.+#'/-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

/** Use local inference for open-ended questions that benefit from synthesis or reasoning. */
export function shouldUseLocalPortfolioGeneration(query) {
  const normalized = normalizeQuestion(query)
  // Route hiring decisions and candidate assessments to the model even though
  // the deterministic layer has a career-fit overview. These need synthesis,
  // trade-offs, and a qualified recommendation rather than a canned list.
  const asksHiringJudgement = /\b(?:should i|should we|would you|would an? employer|would a company|is andrew|is he|do you think|assess|evaluate)\b.{0,90}\b(?:hire|hiring|recruit|employ|candidate|fit|suitable|qualified|role|job|team|position|strong)\b/.test(normalized)
    || /\b(?:hire|recruit|employ)\s+(?:andrew|him|this candidate)\b/.test(normalized)
    || /\b(?:good hire|worth hiring|candidate assessment|candidate fit)\b/.test(normalized)
  if (asksHiringJudgement) return true

  // Never route simple contact, identity, or education lookups through a small model.
  if (/\b(?:email address|email id|e-mail address|contact details|how to contact|how can i contact|reach andrew|linkedin profile|github profile|resume|résumé|curriculum vitae|cgpa|gpa|who is andrew|who am i|your name|his name|my name)\b/.test(normalized)) return false
  return /\b(?:why|explain|compare|comparison|difference|differences|versus|vs|analy[sz]e|evaluate|review|critique|improve|create|write|draft|design|propose|plan|roadmap|pitch|interview|brainstorm|recommend|recommendation|suggest|ideas|pros and cons|strengths|weaknesses|limitations?|risk|risks|trade offs|tradeoffs|combine|could|would|what do you think|your thoughts|opinion|special|standout|stand out|impressive|best|strongest|better|fit|suitable|how does|how do|how can|how could|how would|what should|step by step|teach me|in simple terms|help me|security review|architecture)\b/.test(normalized)
}

const projectAliases = {
  oscar: ['oscar', 'desktop automation agent', 'desktop agent'],
  tradeassist: ['tradeassist', 'trade assist', 'trading project', 'backtesting project'],
  finverse: ['finverse', 'fin verse', 'payment platform'],
  'toll-system': ['dynamic toll charging system', 'toll charging system', 'toll system', 'tollgate project', 'anpr toll'],
  'kyc-smartcard': ['kyc smart card', 'kyc smartcard', 'smart card', 'smartcard project'],
}

function mentionedProjects(query) {
  const normalized = normalizeQuestion(query)
  return projects.filter((project) => {
    const aliases = [project.name.toLowerCase(), project.id.replaceAll('-', ' '), ...(projectAliases[project.id] ?? [])]
    return aliases.some((alias) => new RegExp(`(?:^|\\b)${alias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:$|\\b)`, 'i').test(normalized))
  })
}

function projectDocument(project) {
  return projectDocs.find((document) => document.projectId === project.id)
}

function answerAboutProject(project, question) {
  const normalized = normalizeQuestion(question)
  const asksMetrics = /\b(metric|result|performance|return|drawdown|cagr|trade|backtest|profit|win rate|sharpe)\b/.test(normalized)
  const asksLimitations = /\b(limit|limitation|limitations|weakness|weaknesses|risk|caveat|caveats|secure|security|production|production ready|real world|real-world|issue|issues|what is missing)\b/.test(normalized)
  const asksStack = /\b(stack|technology|technologies|framework|frameworks|language|languages|built with|tools|library|libraries|database)\b/.test(normalized)
  const asksWorkflow = /\b(how|architecture|architect|workflow|flow|process|work|works|under the hood|design|components|features)\b/.test(normalized)
  const lines = [`${project.name}: ${project.summary}`]

  if (asksMetrics && project.metrics?.length) {
    lines.push(`Recorded results: ${project.metrics.map((metric) => `${metric.label}: ${metric.value}`).join('; ')}.`)
    if (project.metricsNote) lines.push(project.metricsNote)
  } else if (asksLimitations) {
    if (project.scopeNote) lines.push(`Scope: ${project.scopeNote}`)
    if (project.implementationCaveats?.length) lines.push(`Known caveats:\n${bullets(project.implementationCaveats)}`)
    if (!project.implementationCaveats?.length && !project.scopeNote) lines.push('The portfolio does not document additional implementation limitations for this project.')
  } else if (asksStack) {
    lines.push(`Technology stack: ${project.stack.join(', ')}.`)
    lines.push(`Documented implementation: ${project.points.slice(0, 3).join(' ')}`)
  } else if (asksWorkflow) {
    lines.push(`Technology stack: ${project.stack.join(', ')}.`)
    if (project.workflow?.length) lines.push(`Workflow:\n${bullets(project.workflow.map((step) => `${step.title}: ${step.detail}`))}`)
    lines.push(`Implementation details: ${project.points.slice(0, 3).join(' ')}`)
    if (project.scopeNote) lines.push(`Scope: ${project.scopeNote}`)
  } else {
    lines.push(`Type: ${project.kind}.`)
    lines.push(`Key details:\n${bullets(project.points.slice(0, 4))}`)
    lines.push(`Technology stack: ${project.stack.join(', ')}.`)
    if (project.workflow?.length) lines.push(`Workflow:\n${bullets(project.workflow.slice(0, 4).map((step) => `${step.title}: ${step.detail}`))}`)
    if (project.metrics?.length) lines.push(`Recorded results: ${project.metrics.map((metric) => `${metric.label}: ${metric.value}`).join('; ')}. ${project.metricsNote ?? ''}`)
    if (project.scopeNote) lines.push(`Scope: ${project.scopeNote}`)
    if (project.implementationCaveats?.length) lines.push(`Known caveats:\n${bullets(project.implementationCaveats)}`)
  }

  if (project.repo) lines.push(`Repository: ${project.repo}`)
  return { answer: lines.join('\n\n'), sources: [projectDocument(project)].filter(Boolean) }
}

/** Route navigation commands through the desktop window manager instead of treating them as knowledge questions. */
export function resolvePortfolioNavigationCommand(query) {
  const normalized = normalizeQuestion(query).replace(/[!?.,]+$/g, '').trim()
  const match = normalized.match(/^(?:(?:please|can you|could you) )?(?:open|launch|go to|take me to|navigate to|bring up|switch to) (?:the )?(?:my )?(.+?)(?: app| window)?$/)
  if (!match || /\b(pdf|download)\b/.test(match[1])) return null
  const target = match[1].replace(/^(?:the|my) /, '').trim()
  const destinations = [
    { aliases: ['skill', 'skills', 'tools', 'skills and tools', 'toolbox'], appTarget: 'skills', label: 'Skills & Tools' },
    { aliases: ['resume', 'cv', 'curriculum vitae'], appTarget: 'resume', label: 'Resume' },
    { aliases: ['project', 'projects', 'case studies', 'case study', 'portfolio projects'], appTarget: 'projects', label: 'Projects' },
    { aliases: ['paper', 'papers', 'publication', 'publications', 'research'], appTarget: 'papers', label: 'Publications' },
    { aliases: ['about', 'about me', 'profile', 'home', 'quick view'], appTarget: 'about', label: 'About Andrew' },
    { aliases: ['contact', 'contacts', 'email', 'contact details'], appTarget: 'contact', label: 'Contact' },
    { aliases: ['assistant', 'ai', 'portfolio assistant', 'ask my portfolio'], appTarget: 'assistant', label: 'Ask My Portfolio' },
    { aliases: ['file explorer', 'explorer', 'files', 'file manager'], appTarget: 'explorer', label: 'File Explorer' },
    { aliases: ['terminal', 'command line', 'cli'], appTarget: 'terminal', label: 'Terminal' },
    { aliases: ['settings', 'preferences'], appTarget: 'settings', label: 'Settings' },
    { aliases: ['games', 'game'], appTarget: 'games', label: 'Games' },
    { aliases: ['recycle bin', 'trash', 'bin'], appTarget: 'bin', label: 'Recycle Bin' },
  ]
  const destination = destinations.find((item) => item.aliases.includes(target))
  return destination ? { appTarget: destination.appTarget, label: destination.label } : null
}

/** Adds the last cited topic to concise follow-ups such as "what about its limitations?" */
export function contextualizePortfolioQuestion(query, previousMessages = []) {
  const text = String(query ?? '').trim()
  const normalized = normalizeQuestion(text)
  const needsContext = /^(?:and |also |what about |how about |why |how does it |how is it |what is it |what does it |can you explain more|tell me more|elaborate|go deeper|more details|its |their |they |them |those |that |this )/.test(normalized)
    || /\b(?:its limitations|their limitations|its stack|its architecture|what about that|what about it|tell me more about it|go into more detail)\b/.test(normalized)
  if (!needsContext) return text
  if (mentionedProjects(normalized).length) return text

  const priorAnswer = [...previousMessages].reverse().find((message) => message.role === 'assistant' && message.sources?.length)
  if (!priorAnswer) return text
  const topicDocs = priorAnswer.sources.filter((source) => source?.type && ['project', 'publication', 'skills', 'experience', 'profile'].includes(source.type))
  const topics = [...new Set(topicDocs.slice(0, 2).map((source) => source.title).filter(Boolean))]
  return topics.length ? `${text} (follow-up topic: ${topics.join(' and ')})` : text
}

/** Deterministic answers for common queries and verifiable portfolio facts. */
export function resolveDirectPortfolioAnswer(query) {
  const queryText = String(query ?? '').trim()
  const normalized = normalizeQuestion(queryText)
  if (!normalized) return null
  const sources = [profileDoc]

  if (/^(?:hi+|hello+|hey+|heya|hiya|yo|howdy|sup|what's up|whats up|good morning|good afternoon|good evening)(?: there| assistant| portfolio| ai| andrew)?$/.test(normalized)) {
    return { answer: "Hey! 👋 I'm Ask My Portfolio, your guide to Andrew Neil's work. I can explain projects, compare architectures, share skills and experience, find published papers, and point you to the resume or contact links.", sources: [] }
  }
  if (/^(?:how are you|how's it going|hows it going|how are things)$/.test(normalized)) {
    return { answer: "Doing well! 😊 I’m here to help people explore Andrew’s portfolio. Want a project overview, skills summary, or resume link?", sources: [] }
  }
  if (/^(?:thanks|thank you|thx|ty|thank you so much|that's helpful|that helps|cool thanks|awesome thanks)$/.test(normalized)) {
    return { answer: "You're welcome! 😊 Ask me about any project, its tech stack or limitations—or say something like ‘compare OSCAR and FinVerse’. ", sources: [] }
  }
  if (/^(?:bye|goodbye|see you|see ya|that's all|that is all)$/.test(normalized)) {
    return { answer: 'See you! 👋 You can come back any time to explore Andrew’s projects, skills, research or resume.', sources: [] }
  }
  if (/\b(?:what can you do|what can i ask|what should i ask|help me|help|suggest questions|examples of questions|what do you know)\b/.test(normalized)) {
    return {
      answer: "You can ask me things like:\n" + bullets([
        'Give me a quick summary of Andrew’s background.',
        'Explain OSCAR’s architecture or reliability safeguards.',
        'Compare OSCAR and FinVerse.',
        'What skills, languages and frameworks does Andrew use?',
        'What are the limitations of FinVerse?',
        'What were TradeAssist’s recorded backtest results?',
        'Which papers has Andrew published?',
        'What roles fit his documented experience?',
        'Open Skills, Projects, Publications, or Resume.',
      ]) + '\n\nI focus on facts in this portfolio and clearly flag when something is not documented.',
      sources: [profileDoc, skillsDoc, ...projectDocs.slice(0, 2)],
    }
  }

  if (/\b(?:what(?:'s|s| is) your name|tell me your name|who are you|what are you called|what is your purpose|what are you|are you (?:an? ai|chatgpt)|what model are you)\b/.test(normalized)) {
    return { answer: "I'm Ask My Portfolio, the portfolio assistant for Andrew Neil. When Local AI is enabled, I can also use a small language model running in your browser; simple facts and desktop commands are answered directly for accuracy.", sources: [] }
  }
  if (/\b(?:what(?:'s|s| is) (?:my|his|andrew(?:'s)?|the owner's?) (?:full )?name|who am i|who is andrew|who is this portfolio about|what is andrew's full name|what's his name)\b/.test(normalized) || /\b(?:my|his|andrew's) name\b/.test(normalized)) {
    return { answer: 'The portfolio belongs to Andrew Neil.', sources }
  }
  if (/\b(?:email|e-mail)\b/.test(normalized)) {
    return { answer: `Andrew Neil's email address is ${profile.email}.`, sources }
  }
  if (/\b(?:contact|reach|connect with|get in touch|reach out|how can i talk to)\b/.test(normalized)) {
    const methods = [`Email: ${profile.email}`, `GitHub: ${profile.github}`]
    if (profile.linkedin) methods.push(`LinkedIn: ${profile.linkedin}`)
    return { answer: `You can contact Andrew Neil through these listed public links:\n${bullets(methods)}`, sources }
  }
  if (/\b(?:github|github profile|source code|repository|repo link)\b/.test(normalized)) {
    return { answer: `Andrew Neil's GitHub profile is ${profile.github}.`, sources }
  }
  if (/\b(?:linkedin|linkedin profile)\b/.test(normalized)) {
    return profile.linkedin ? { answer: `Andrew Neil's LinkedIn profile is ${profile.linkedin}.`, sources } : { answer: "A LinkedIn profile link isn't listed in the portfolio data.", sources }
  }
  if (/\b(?:resume|résumé|cv|curriculum vitae)\b/.test(normalized)) {
    return { answer: `Andrew's resume is available at ${profile.resume}. Use the Resume PDF link below to open it, or say “open resume” to view the resume window.`, sources }
  }

  if (/\b(?:what is this website|what is this site|what is this portfolio|what does this website do|what is this page|what am i looking at)\b/.test(normalized)) {
    return { answer: `This is Andrew Neil’s interactive developer portfolio, styled like a desktop operating system. Explore project case studies, technical stacks and limitations, published research, skills, experience, and the resume. You can ask me questions in natural language or use commands such as “open skills” and “open publications”.`, sources: [profileDoc, ...projectDocs.slice(0, 2)] }
  }

  if (/\b(?:what is andrew studying|what does andrew study|what is he studying|what degree|which degree|what college|what university|where does he study|education|cgpa|gpa|grade point|graduat(?:e|ion)|what year|class of)\b/.test(normalized)) {
    return { answer: `Andrew is studying ${education.degree} at ${education.school}. ${education.when}. Current recorded CGPA: ${education.cgpa}. Relevant coursework includes ${education.courses}.`, sources }
  }
  if (/\b(?:summari[sz]e (?:andrew|his|this portfolio)|quick profile|about andrew|tell me about andrew|who is andrew|what does andrew do|introduce andrew|profile summary|tell me about yourself)\b/.test(normalized)) {
    return { answer: `${profile.name} is a ${profile.role} at ${profile.school}, graduating in ${profile.grad}. His focus is ${profile.tagline} ${profile.bio.join(' ')}\n\nHighlights:\n${bullets(highlights)}`, sources: [profileDoc, experienceDoc] }
  }
  const asksAgenticProjects = /\b(agentic|agents|automation|automate|computer use)\b/.test(normalized)
    && /\b(project|projects|work|experience|show|demonstrate|best|strongest|which|evidence|example)\b/.test(normalized)
  if (asksAgenticProjects) {
    const oscar = projects.find((project) => project.id === 'oscar')
    const finverse = projects.find((project) => project.id === 'finverse')
    return {
      answer: `OSCAR is the clearest example of agentic automation in this portfolio. ${oscar.summary}\n\nIts documented workflow plans and routes actions to browser, desktop UI, or terminal agents, then uses fresh observations, bounded retries and outcome checks. FinVerse explores AI-assisted financial workflows, but it is a financial-platform prototype rather than a documented general-purpose agent.`,
      sources: [projectDocument(oscar), projectDocument(finverse)].filter(Boolean),
    }
  }

  if (/\b(?:experience|internship|intern|freelance|upwork|work history|previous work|professional background)\b/.test(normalized)) {
    return { answer: `Experience summary:\n${experience.map((item) => `• ${item.role} — ${item.org} (${item.when}): ${item.points.join(' ')}`).join('\n')}\n\n${highlights.filter((item) => /upwork|intern/i.test(item)).join('\n')}`, sources: [experienceDoc, profileDoc] }
  }
  if (/\b(?:job fit|roles? (?:fit|suit|match)|what job|which job|career path|hire andrew|why hire|why should i hire|suitable roles?|what roles|looking for a job)\b/.test(normalized)) {
    return { answer: `Based on the documented portfolio, the clearest role matches are:\n${bullets(['AI automation / agentic AI engineering, supported by OSCAR’s tool-using workflow prototype.', 'Python backend engineering, supported by the Django internship work and backend/data skills.', 'Computer-vision or applied AI prototyping, supported by the YOLOv8/OCR toll system.', 'Full-stack / IoT prototyping, supported by FinVerse and KYC Smart Card.'])}\n\nThese are evidence-based directions, not a guarantee of hiring outcomes; the linked resume and case studies are the best place to assess depth and scope.`, sources: [profileDoc, experienceDoc, skillsDoc, ...projectDocs] }
  }

  if (/\b(?:how many|number of|count of)\b.*\b(?:papers?|publications?|research papers?)\b/.test(normalized) || /\b(?:papers?|publications?)\b.*\b(?:how many|count|number)\b/.test(normalized)) {
    return { answer: `The portfolio lists ${publications.length} published papers:\n${bullets(publications.map((paper) => `${paper.title} — ${paper.where}`))}`, sources: publicationDocs }
  }
  if (/\b(?:papers?|publications?|published|research)\b/.test(normalized)) {
    return { answer: `Published research listed in the portfolio (${publications.length} papers):\n${bullets(publications.map((paper) => `${paper.title} — ${paper.where}`))}\n\nUse the Read paper links below to open the publications.`, sources: publicationDocs }
  }
  if (/\b(?:won|winner|winning|competition|award|achievement|accomplishment|stand out|highlights)\b/.test(normalized)) {
    return { answer: `Portfolio highlights:\n${bullets(highlights)}\n\nThe Dynamic Toll Charging System is listed as the college mini-project competition winner.`, sources: [profileDoc, projectDocument(projects.find((project) => project.id === 'toll-system'))].filter(Boolean) }
  }

  const asksProjectList = /\b(?:show|list|give|name|tell me about)\b.*\bprojects?\b|\b(?:what|which) projects\b|\bwhat are (?:all )?(?:his|her|andrew's|the) projects\b|\bwhat projects (?:has|have|does)\b|\bprojects?\b.*\b(?:built|created|worked on)\b|\bthings have you built\b|\bshow me his project\b/.test(normalized)
  if (asksProjectList) {
    return { answer: `Here are the projects documented in Andrew Neil's portfolio:\n${projects.map((project) => `• ${project.name}: ${project.summary}`).join('\n')}\n\nEach case study lists its technology stack, workflow and known limitations.`, sources: projectDocs }
  }

  const mentioned = mentionedProjects(normalized)
  const asksComparison = /\b(?:compare|comparison|difference between|differences|versus|vs\.?|contrast|which is better)\b/.test(normalized)
  if (asksComparison && mentioned.length >= 2) {
    const comparison = mentioned.slice(0, 3).map((project) => `${project.name}\n• Focus: ${project.summary}\n• Stack: ${project.stack.join(', ')}\n• Scope: ${project.scopeNote ?? project.kind}`).join('\n\n')
    return { answer: `Here’s a portfolio-grounded comparison:\n\n${comparison}\n\nThey target different problems, so “better” depends on whether you care most about agentic automation, quantitative research, fintech/IoT, computer vision, or identity verification.`, sources: mentioned.slice(0, 3).map(projectDocument).filter(Boolean) }
  }
  if (/\b(?:best|strongest|most impressive|standout|stand out|favorite)\b.*\bproject\b|\b(?:which|what) project\b.*\b(?:best|better|strongest)\b/.test(normalized)) {
    return { answer: `There isn't one objectively best project; it depends on the role:\n${bullets(['For Agentic AI and desktop/browser automation: OSCAR.', 'For quantitative research, metrics and risk controls: TradeAssist.', 'For computer vision and a competition result: Dynamic Toll Charging System.', 'For fintech, hardware authentication and IoT: FinVerse.', 'For identity/document workflows and dual-mode authentication: KYC Smart Card.'])}\n\nFor an Agentic AI interview, OSCAR is the strongest fit to lead with because its documented workflow centers on planning, tool routing, observation and outcome checks.`, sources: projectDocs }
  }

  const namedProjects = mentionedProjects(normalized)
  if (namedProjects.length === 1) return answerAboutProject(namedProjects[0], queryText)

  if (/\b(?:best|strongest|most impressive|standout|stand out|favorite)\b.*\bproject\b|\b(?:which|what) project\b.*\b(?:best|better|strongest)\b/.test(normalized)) {
    return { answer: `There isn't one objectively best project; it depends on the role:\n${bullets(['For Agentic AI and desktop/browser automation: OSCAR.', 'For quantitative research, metrics and risk controls: TradeAssist.', 'For computer vision and a competition result: Dynamic Toll Charging System.', 'For fintech, hardware authentication and IoT: FinVerse.', 'For identity/document workflows and dual-mode authentication: KYC Smart Card.'])}\n\nFor an Agentic AI interview, OSCAR is the strongest fit to lead with because its documented workflow centers on planning, tool routing, observation and outcome checks.`, sources: projectDocs }
  }

  if (/\b(?:skill|skills|technology|technologies|tech stack|tools|frameworks|programming languages|languages|what can he code|what does he know)\b/.test(normalized)) {
    const groupMatch = Object.keys(skills).find((group) => normalizeQuestion(group).split(' ').some((token) => token.length > 3 && normalized.includes(token)))
    const languageOnly = /\b(?:programming languages|languages does|which languages|coding languages)\b/.test(normalized)
    const aiOnly = /\b(?:agentic ai|ai skills|machine learning|ml skills|ai tools|automation skills)\b/.test(normalized)
    const backendOnly = /\b(?:backend|back end|api skills|server side|databases?)\b/.test(normalized)
    const selectedGroups = languageOnly ? ['Languages'] : aiOnly ? ['AI and automation', 'ML and vision'] : backendOnly ? ['Backend and data'] : groupMatch ? [groupMatch] : Object.keys(skills)
    return { answer: `Technical skills and tools${selectedGroups.length === 1 ? ` — ${selectedGroups[0]}` : ''}:\n${selectedGroups.map((group) => `• ${group}: ${skills[group].join(', ')}`).join('\n')}\n\nThis is the portfolio’s technology inventory, not a claim that every tool is used at the same proficiency level.`, sources: [skillsDoc] }
  }

  if (/\b(?:what about its|what about their|its limitations|their limitations|its stack|its architecture|what about it|tell me more|elaborate|go deeper|more details)\b/.test(normalized) && mentionedProjects(normalized).length === 0) {
    return { answer: 'Which project should I dig into—OSCAR, TradeAssist, FinVerse, Dynamic Toll Charging System, or KYC Smart Card? I can explain its architecture, technology stack, results, or limitations.', sources: projectDocs }
  }

  return null
}

export function buildQuickPortfolioAnswer(query) {
  const queryText = String(query ?? '').trim()
  const directAnswer = resolveDirectPortfolioAnswer(queryText)
  if (directAnswer) return directAnswer
  const normalized = queryText.toLowerCase()
  const wantsAgenticProjects = /\b(agentic|agents|automation|automate)\b/.test(normalized) && /\b(project|projects|work|experience|show|demonstrate)\b/.test(normalized)
  const wantsProjects = /\b(?:show|list|name|tell me about)\b.*\b(?:projects?|work)\b|\b(?:what|which)\b.*\bprojects?\b|\bprojects?\b.*\b(?:built|created|worked on)\b|\bthings have you built\b/.test(normalized)
  const wantsMetrics = /\b(metric|result|performance|return|drawdown|cagr|trade|backtest)\b/.test(normalized)
  const wantsContact = /\b(contact|email|reach|linkedin|github|resume|cv)\b/.test(normalized)
  const wantsExperience = /\b(experience|internship|intern|freelance|upwork|work history)\b/.test(normalized)
  const wantsSkills = /\b(skill|skills|technology|technologies|tech stack|tools|frameworks|programming languages)\b/.test(normalized)
  const wantsPapers = /\b(papers?|publications?|published|research)\b/.test(normalized)

  const namedProject = mentionedProjects(normalized)
  if (namedProject.length === 1 && !wantsProjects && !wantsAgenticProjects) return answerAboutProject(namedProject[0], queryText)
  if (namedProject.length >= 2 && /\b(?:compare|comparison|difference between|differences|versus|vs\.?|contrast|which is better)\b/.test(normalized)) {
    return { answer: `Here’s a portfolio-grounded comparison:\n\n${namedProject.slice(0, 3).map((project) => `${project.name}\n• Focus: ${project.summary}\n• Stack: ${project.stack.join(', ')}\n• Scope: ${project.scopeNote ?? project.kind}`).join('\n\n')}\n\nThe better choice depends on the problem you want to demonstrate.`, sources: namedProject.slice(0, 3).map(projectDocument).filter(Boolean) }
  }

  if (wantsContact) {
    const lines = [`Email: ${profile.email}`, `GitHub: ${profile.github}`, ...(profile.linkedin ? [`LinkedIn: ${profile.linkedin}`] : []), `Resume: ${profile.resume}`]
    return { answer: `Here are Andrew's public portfolio links:\n${bullets(lines)}\n\nThe resume PDF is included with the site.`, sources: [profileDoc] }
  }
  if (wantsAgenticProjects) {
    const oscar = projects.find((project) => project.id === 'oscar')
    const finverse = projects.find((project) => project.id === 'finverse')
    const candidates = [oscar, finverse].filter(Boolean)
    return {
      answer: `OSCAR is the clearest example of agentic automation in this portfolio. ${oscar.summary}\n\nIts documented workflow includes planning and routing to browser, desktop UI, or terminal agents, then using fresh observations and outcome checks. ${finverse.name} also explores AI-assisted financial workflows, but it is a financial-platform prototype rather than a documented general-purpose agent.`,
      sources: candidates.map((project) => projectDocs.find((item) => item.projectId === project.id)).filter(Boolean),
    }
  }
  if (wantsExperience) {
    return { answer: `Experience summary:\n${experience.map((item) => `• ${item.role} — ${item.org} (${item.when}): ${item.points.join(' ')}`).join('\n')}`, sources: [experienceDoc, profileDoc] }
  }
  if (wantsSkills) {
    return { answer: `Technical skills and tools:\n${Object.entries(skills).map(([group, items]) => `• ${group}: ${items.join(', ')}`).join('\n')}`, sources: [skillsDoc] }
  }
  if (wantsPapers) {
    return { answer: `Published research listed in the portfolio:\n${publications.map((paper) => `• ${paper.title} — ${paper.where}`).join('\n')}\n\nUse the source links below to open each paper.`, sources: publicationDocs }
  }
  if (wantsProjects) {
    const docs = projectDocs.slice(0, 5)
    return { answer: `The portfolio highlights ${projects.length} projects:\n${projects.map((project) => `• ${project.name}: ${project.summary}`).join('\n')}\n\nEach case study also lists its technology stack, workflow, and scope limitations.`, sources: docs }
  }

  const matches = rankPortfolioKnowledge(queryText, 4)
  if (!matches.length || matches[0].score < 2) {
    return {
      answer: `I couldn't find a verified portfolio fact that directly answers that. Try asking about OSCAR, TradeAssist, FinVerse, KYC Smart Card, the toll system, skills, experience, publications, or contact details.\n\nI only use the portfolio's curated information here; I won't invent missing project details.`,
      sources: [profileDoc, ...projectDocs.slice(0, 3)],
    }
  }

  const best = matches[0]
  if (best.type === 'project' || best.type === 'publication') {
    const project = best.type === 'project' ? projects.find((item) => item.id === best.projectId) : null
    if (project) {
      const intro = `${project.name}: ${project.summary}`
      const detail = project.points.slice(0, 3)
      const metrics = wantsMetrics && project.metrics?.length ? `\n\nRecorded result: ${project.metrics.map((metric) => `${metric.label}: ${metric.value}`).join('; ')}. ${project.metricsNote ?? ''}` : ''
      return {
        answer: `${intro}\n\nKey details:\n${bullets(detail)}${project.workflow?.length ? `\n\nWorkflow:\n${bullets(project.workflow.slice(0, 4).map((step) => `${step.title}: ${step.detail}`))}` : ''}\n\nTechnology stack: ${project.stack.join(', ')}.${metrics}${project.implementationCaveats?.length ? `\n\nKnown implementation caveats:\n${bullets(project.implementationCaveats)}` : ''}\n\nScope: ${project.scopeNote}`,
        sources: matches.slice(0, 3),
      }
    }
  }

  if (best.type === 'profile') {
    return { answer: `${profile.name} is a ${profile.role} at ${profile.school}, graduating in ${profile.grad}. ${profile.tagline}\n\n${profile.bio.join(' ')}`, sources: [profileDoc] }
  }
  return {
    answer: `Here's the most relevant information I found:\n\n${matches.slice(0, 3).map((item) => `${item.title}\n${item.body}`).join('\n\n')}`,
    sources: matches.slice(0, 3),
  }
}

export function buildLocalModelContext(matches) {
  const supplied = Array.isArray(matches) ? matches : []
  const fallbackContext = [profileDoc, skillsDoc, experienceDoc, ...projectDocs.slice(0, 3)]
  const documents = supplied.length ? supplied : fallbackContext
  return documents.slice(0, 6).map((item) => {
    const sourceDetails = (item.sources ?? []).map((source) => source.href ? `${source.label}: ${source.href}` : `${source.label ?? source.appTarget ?? 'Source'}${source.projectId ? ` (${source.projectId})` : ''}`).join('\n')
    return `SOURCE: ${item.title}\nCATEGORY: ${item.category}\nFACTS:\n${item.body}${sourceDetails ? `\nVERIFIED LINKS / DESTINATIONS:\n${sourceDetails}` : ''}`
  }).join('\n\n---\n\n').slice(0, 12000)
}
