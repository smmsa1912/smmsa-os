import { skills } from '../data'

const GROUP_NOTES = {
  Languages: 'Core programming and query languages',
  'AI and automation': 'LLM integrations, agents, and browser / desktop workflows',
  'ML and vision': 'Data analysis, model training, image processing, and OCR',
  'Backend and data': 'API design, application logic, persistence, and testing',
  'Tools and systems': 'Frontend, developer workflow, and hardware integration',
}

export default function Skills() {
  const total = Object.values(skills).reduce((count, group) => count + group.length, 0)

  return (
    <div className="skills-app">
      <header className="skills-header">
        <p className="portfolio-kicker">TOOLBOX / STACK</p>
        <h2>Skills & tools</h2>
        <p>A practical overview of technologies used across my projects, coursework, and engineering work.</p>
        <div className="skills-summary"><strong>{total}</strong><span>TOOLS ACROSS {Object.keys(skills).length} CATEGORIES</span></div>
      </header>
      <div className="skills-grid">
        {Object.entries(skills).map(([group, items], index) => (
          <section key={group} className={`skills-group skills-group-${index + 1}`}>
            <div className="skills-group-top"><span>0{index + 1}</span><span>{String(items.length).padStart(2, '0')} ITEMS</span></div>
            <h3>{group}</h3>
            <p>{GROUP_NOTES[group] ?? 'Technologies used across project work'}</p>
            <div className="chips skills-chips">{items.map((item) => <span key={item} className="chip">{item}</span>)}</div>
          </section>
        ))}
      </div>
      <p className="skills-footnote">This is a technology inventory, not a claim that every tool is used at the same proficiency level.</p>
    </div>
  )
}
