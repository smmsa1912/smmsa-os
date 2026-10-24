import { publications } from '../data'

export default function Publications() {
  return (
    <section className="papers-app">
      <header className="papers-header">
        <p className="portfolio-kicker">RESEARCH / WRITTEN WORK</p>
        <h2>Published papers</h2>
        <div className="papers-count"><strong>{String(publications.length).padStart(2, '0')}</strong><span>PUBLICATIONS</span></div>
      </header>
      <div className="papers-list">
        {publications.map((paper, index) => (
          <article className={`paper-card paper-card-${index + 1}`} key={paper.id}>
            <div className="paper-card-meta"><span>0{index + 1} / {paper.format}</span><span>{paper.where}</span></div>
            <h3>{paper.title}</h3>
            <p>{paper.summary}</p>
            <div className="chips paper-tags">
              {paper.topics.map((topic) => <span className="chip" key={topic}>{topic}</span>)}
            </div>
            <footer className="paper-card-footer">
              <a href={paper.href} target="_blank" rel="noopener noreferrer">Read paper <span aria-hidden="true">↗</span></a>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
