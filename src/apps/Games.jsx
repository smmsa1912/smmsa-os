import { useState } from 'react'
import { useOS } from '../store'
import Snake from './Snake'
import Memory from './Memory'
import TwentyFortyEight from './TwentyFortyEight'
import ReactionRush from './ReactionRush'

const ARCADE_GAMES = [
  { id: 'snake', label: 'Snake', symbol: '▰', hint: 'Collect pixels. Avoid yourself.' },
  { id: 'memory', label: 'Memory', symbol: '▦', hint: 'Match the tech-themed pairs.' },
  { id: '2048', label: '2048', symbol: '▧', hint: 'Merge number tiles to reach 2048.' },
  { id: 'reaction', label: 'Reaction Rush', symbol: '⚡', hint: 'Test your reflexes.' },
]

export default function Games() {
  const [tab, setTab] = useState('snake')
  const focused = useOS((s) => {
    const w = s.windows.find((x) => x.appId === 'games')
    return Boolean(w) && !w.minimized && s.activeId === w.id
  })

  return (
    <div className="games">
      <header className="games-heading">
        <div className="games-heading-icon" aria-hidden="true">✦</div>
        <div><p className="game-kicker">SMMSA ARCADE · 4 GAMES</p><h2>Game Center</h2><p>Take a quick break. Your best scores stay on this device.</p></div>
      </header>
      <div className="games-tabs" role="tablist" aria-label="Choose a game">
        {ARCADE_GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            role="tab"
            id={`game-tab-${game.id}`}
            aria-controls={`game-panel-${game.id}`}
            aria-selected={tab === game.id}
            tabIndex={tab === game.id ? 0 : -1}
            className={tab === game.id ? 'on' : ''}
            onClick={() => setTab(game.id)}
            onKeyDown={(event) => {
              const current = ARCADE_GAMES.findIndex((item) => item.id === game.id)
              let next = current
              if (event.key === 'ArrowRight') next = (current + 1) % ARCADE_GAMES.length
              else if (event.key === 'ArrowLeft') next = (current - 1 + ARCADE_GAMES.length) % ARCADE_GAMES.length
              else if (event.key === 'Home') next = 0
              else if (event.key === 'End') next = ARCADE_GAMES.length - 1
              else return
              event.preventDefault()
              setTab(ARCADE_GAMES[next].id)
              document.getElementById(`game-tab-${ARCADE_GAMES[next].id}`)?.focus()
            }}
          >
            <span aria-hidden="true">{game.symbol}</span><span>{game.label}</span>
          </button>
        ))}
      </div>
      <div className="game-caption">{ARCADE_GAMES.find((game) => game.id === tab)?.hint}</div>
      <div role="tabpanel" id={`game-panel-${tab}`} aria-labelledby={`game-tab-${tab}`} className="game-panel">
        {tab === 'snake' && <Snake focused={focused} />}
        {tab === 'memory' && <Memory focused={focused} />}
        {tab === '2048' && <TwentyFortyEight focused={focused} />}
        {tab === 'reaction' && <ReactionRush key={focused ? 'active-window' : 'inactive-window'} />}
      </div>
    </div>
  )
}
