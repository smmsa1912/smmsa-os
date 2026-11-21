// Explicit evidence mapping; this is not an LLM, scoring model, or hiring verdict.
export const capabilities = [
  { label: 'Agent orchestration and tool calling', terms: ['agentic', 'agents', 'agent orchestration', 'tool calling', 'function calling', 'multi-agent'], evidence: 'OSCAR 2.x orchestration, 3.0 typed execution architecture and Autonomous Research Agent tool workflows', project: 'oscar' },
  { label: 'Research agents and evidence synthesis', terms: ['research agent', 'research automation', 'web search', 'citation', 'arxiv', 'wikipedia'], evidence: 'Autonomous Research Agent: iterative tool use, evidence retrieval and structured citation-backed reports', project: 'research-agent' },
  { label: 'Python backend and APIs', terms: ['python', 'fastapi', 'django', 'rest api', 'backend'], evidence: '4i Studio ERP backend and Python engineering projects', project: 'oscar' },
  { label: 'Retrieval and LLM applications', terms: ['rag', 'retrieval', 'embeddings', 'vector search', 'llm', 'langchain', 'langgraph'], evidence: 'Documented LLM tooling, local portfolio retrieval and paid LLM workflow development', project: null },
  { label: 'Reliability, evaluation and testing', terms: ['testing', 'pytest', 'evaluation', 'guardrails', 'reliability', 'human-in-the-loop', 'permissions'], evidence: 'OSCAR safety gates and recorded regression verification; TradeAssist test-driven research', project: 'oscar' },
  { label: 'Browser and computer-use automation', terms: ['playwright', 'selenium', 'browser automation', 'computer use', 'computer-use'], evidence: 'OSCAR computer-use workflows and paid appointment monitoring', project: 'oscar' },
  { label: 'Applied machine learning', terms: ['machine learning', 'computer vision', 'opencv', 'yolo', 'ocr', 'scikit-learn'], evidence: 'Dynamic Toll Charging and Language Identification prototypes', project: 'toll-system' },
  { label: 'Deployment and infrastructure', terms: ['kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'distributed systems'], evidence: 'No detailed production infrastructure evidence in the current portfolio; discuss during interview.', project: null, gap: true },
]

export function matchRole(description) {
  const text = String(description || '').toLowerCase()
  return capabilities.filter(item => item.terms.some(term => new RegExp(`(?:^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i').test(text)))
}
