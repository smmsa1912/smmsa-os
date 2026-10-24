import { profile, education, experience, projects, publications, skills } from '../data'

export default function Resume() {
  return (
    <article className="doc">
      <h2>{profile.name}</h2>
      <p className="lead">{profile.tagline}</p>
      <p className="links">
        <a href={profile.resume} target="_blank" rel="noopener noreferrer">
          Open resume (PDF)
        </a>
        <a href={profile.resume} download>
          Download
        </a>
      </p>

      <h3>Experience</h3>
      {experience.map((e) => (
        <div key={e.id} className="entry">
          <p>
            <strong>{e.role}</strong>, {e.org} <span className="when">{e.when}</span>
          </p>
          <ul className="plain">
            {e.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Education</h3>
      <p>
        <strong>{education.degree}</strong>, {education.school}. {education.when}.
      </p>
      <p>CGPA {education.cgpa}. Coursework: {education.courses}.</p>

      <h3>Projects</h3>
      <ul className="plain">
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.name}.</strong> {p.summary}
          </li>
        ))}
      </ul>

      <h3>Publications</h3>
      <ul className="plain">
        {publications.map((p) => (
          <li key={p.id}>
            <a href={p.href} target="_blank" rel="noopener noreferrer">
              {p.title}
            </a>
            . {p.where}
          </li>
        ))}
      </ul>

      <h3>Skills</h3>
      <ul className="plain">
        {Object.entries(skills).map(([group, items]) => (
          <li key={group}>
            <strong>{group}:</strong> {items.join(', ')}
          </li>
        ))}
      </ul>
    </article>
  )
}
