import { useEffect, useRef, useState } from 'react'

const FACES = ['Python', 'Django', 'React', 'Flutter', 'ESP32', 'RFID', 'YOLO', 'LLM', 'Git', 'SQL']
const PAIR_COUNTS = { easy: 6, normal: 8, expert: 10 }

function shuffled(pairCount = 8) {
  const deck = [...FACES.slice(0, pairCount), ...FACES.slice(0, pairCount)].map((face, id) => ({ id, face }))
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function loadBest(pairCount) {
  try { return Number(localStorage.getItem(`smmsa-memory-best-${pairCount}`)) || 0 } catch { return 0 }
}

export default function Memory({ focused = true }) {
  const [difficulty, setDifficulty] = useState('normal')
  const pairCount = PAIR_COUNTS[difficulty]
  const [cards, setCards] = useState(() => shuffled(PAIR_COUNTS.normal))
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [best, setBest] = useState(() => loadBest(PAIR_COUNTS.normal))
  const timer = useRef(null)
  const won = matched.length === pairCount

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!timerRunning || !focused) return undefined
    const id = setInterval(() => setElapsed((time) => time + 1), 1000)
    return () => clearInterval(id)
  }, [timerRunning, focused])

  const reset = (nextPairCount = pairCount) => {
    clearTimeout(timer.current)
    setCards(shuffled(nextPairCount))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setElapsed(0)
    setTimerRunning(false)
  }

  const changeDifficulty = (event) => {
    const nextDifficulty = event.target.value
    const nextPairCount = PAIR_COUNTS[nextDifficulty]
    setDifficulty(nextDifficulty)
    setBest(loadBest(nextPairCount))
    reset(nextPairCount)
  }

  const flip = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].face)) return
    if (!timerRunning && moves === 0 && flipped.length === 0) setTimerRunning(true)
    const next = [...flipped, index]
    setFlipped(next)
    if (next.length < 2) return
    const nextMoves = moves + 1
    setMoves(nextMoves)
    const [a, b] = next
    if (cards[a].face === cards[b].face) {
      const nextMatched = [...matched, cards[a].face]
      setMatched(nextMatched)
      setFlipped([])
      if (nextMatched.length === pairCount) {
        setTimerRunning(false)
        if (!best || nextMoves < best) {
          setBest(nextMoves)
          try { localStorage.setItem(`smmsa-memory-best-${pairCount}`, String(nextMoves)) } catch { /* Best score remains in memory. */ }
        }
      }
    } else {
      timer.current = setTimeout(() => setFlipped([]), 680)
    }
  }

  const elapsedLabel = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`

  return (
    <div className="game arcade-game memory-game">
      <div className="game-intro">
        <div><span className="game-kicker">MATCHING PUZZLE</span><h3>Memory Match</h3><p>Find the pairs hidden behind the cards.</p></div>
        <div className="game-stats"><span>Moves <strong>{moves}</strong></span><span>Time <strong>{elapsedLabel}</strong></span></div>
      </div>
      <div className="game-controls-row memory-settings">
        <label className="game-select-label">Difficulty
          <select className="game-select" value={difficulty} onChange={changeDifficulty} aria-label="Memory difficulty">
            <option value="easy">Easy · 6 pairs</option><option value="normal">Normal · 8 pairs</option><option value="expert">Expert · 10 pairs</option>
          </select>
        </label>
        <span className="memory-best">Best {best ? `${best} moves` : '—'}</span>
      </div>
      <div className={`cards${difficulty === 'expert' ? ' cards-expert' : ''}`}>
        {cards.map((card, index) => {
          const up = flipped.includes(index) || matched.includes(card.face)
          const isMatched = matched.includes(card.face)
          return (
            <button
              key={card.id}
              type="button"
              className={`card${up ? ' up' : ''}${isMatched ? ' done' : ''}`}
              onClick={() => flip(index)}
              aria-label={up ? `${card.face}${isMatched ? ', matched' : ''}` : `Hidden card ${index + 1}`}
              aria-pressed={up}
              disabled={isMatched || (flipped.length === 2 && !flipped.includes(index))}
            >
              {up ? card.face : <span aria-hidden="true">?</span>}
            </button>
          )
        })}
      </div>
      {won && <div className="memory-win" role="status"><strong>ALL PAIRS FOUND!</strong><span>{moves} moves · {elapsedLabel}</span></div>}
      <button type="button" className="btn" onClick={() => reset()}>{won ? 'Play again' : 'Restart round'}</button>
      <p className="game-hint">The timer begins with your first card. Best moves are saved separately per difficulty.</p>
    </div>
  )
}
