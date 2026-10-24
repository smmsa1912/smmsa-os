import { skills } from '../data'


export default function Skills() {
  const total = Object.values(skills).reduce((count, group) => count + group.length, 0)

  return (
    <div className="skills-app">
      <header className="skills-header">
        <p className="portfolio-kicker">TOOLBOX / STACK</p>
        <h2>Skills & tools</h2>
        
        <div className="skills-summary"><strong>{total}</strong><span>TOOLS ACROSS {Object.keys(skills).length} CATEGORIES</span></div>
      </header>
      <div className="skills-grid">
        {Object.entries(skills).map(([group, items], index) => (
          <section key={group} className={`skills-group skills-group-${index + 1}`}>
            <div className="skills-group-top"><span>0{index + 1}</span><span>{String(items.length).padStart(2, '0')} ITEMS</span></div>
            <h3>{group}</h3>
            <div className="chips skills-chips">{items.map((item) => <span key={item} className="chip">{item}</span>)}</div>
          </section>
        ))}
      </div>
      <p className="skills-footnote">Experience varies by tool.</p>
    </div>
  )
}
