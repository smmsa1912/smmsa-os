import { useCallback, useEffect, useState } from 'react'
import { addRandom2048Tile, create2048Board, has2048Tile, is2048GameOver, move2048Board } from '../game2048'

const DIRECTIONS = [
  { id: 'up', label: '↑', title: 'Move up' },
  { id: 'left', label: '←', title: 'Move left' },
  { id: 'down', label: '↓', title: 'Move down' },
  { id: 'right', label: '→', title: 'Move right' },
]

function loadBest() {
  try { return Number(localStorage.getItem('smmsa-2048-best')) || 0 } catch { return 0 }
}

export default function TwentyFortyEight({ focused }) {
  const [board, setBoard] = useState(create2048Board)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(loadBest)
  const [previous, setPrevious] = useState(null)
  const [won, setWon] = useState(false)
  const [continued, setContinued] = useState(false)
  const [over, setOver] = useState(false)
  const ended = over || (won && !continued)

  const move = useCallback((direction) => {
    if (ended) return
    const result = move2048Board(board, direction)
    if (!result.changed) return
    setPrevious({ board: board.map((row) => [...row]), score })
    const next = addRandom2048Tile(result.board)
    const nextScore = score + result.score
    setBoard(next)
    setScore(nextScore)
    if (nextScore > best) {
      setBest(nextScore)
      try { localStorage.setItem('smmsa-2048-best', String(nextScore)) } catch { /* Best score remains in memory. */ }
    }
    if (!won && has2048Tile(next)) setWon(true)
    setOver(is2048GameOver(next))
  }, [board, ended, score, best, won])

  const restart = () => {
    setBoard(create2048Board())
    setScore(0)
    setPrevious(null)
    setWon(false)
    setContinued(false)
    setOver(false)
  }

  const undo = () => {
    if (!previous) return
    setBoard(previous.board)
    setScore(previous.score)
    setPrevious(null)
    setWon(has2048Tile(previous.board))
    setContinued(false)
    setOver(is2048GameOver(previous.board))
  }

  useEffect(() => {
    if (!focused) return undefined
    const keys = {
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowDown: 'down', s: 'down', S: 'down',
      ArrowRight: 'right', d: 'right', D: 'right',
    }
    const onKeyDown = (event) => {
      if (event.target.closest?.('input, textarea, select')) return
      const direction = keys[event.key]
      if (!direction) return
      event.preventDefault()
      move(direction)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focused, move])

  return (
    <section className="game arcade-game game-2048" aria-label="2048 game">
      <div className="game-intro">
        <div><span className="game-kicker">NUMBER PUZZLE</span><h3>2048</h3><p>Merge matching tiles. Can you reach 2048?</p></div>
        <div className="game-stats"><span>Score <strong>{score}</strong></span><span>Best <strong>{best}</strong></span></div>
      </div>
      <div className="game-controls-row">
        <button type="button" className="btn" onClick={restart}>New game</button>
        <button type="button" className="btn btn-muted" disabled={!previous} onClick={undo}>Undo move</button>
      </div>
      <div className="tiles-2048-wrap">
        <div className="tiles-2048" role="grid" aria-label={`2048 board. Score ${score}.`}>
          {board.flatMap((row, y) => row.map((value, x) => (
            <div key={`${y}-${x}`} role="gridcell" aria-label={value ? String(value) : 'empty'} className={`tile-2048${value ? ` tile-v${Math.min(value, 2048)}` : ''}`}>
              {value || ''}
            </div>
          )))}
        </div>
        {ended && <div className="game-overlay-2048" role="status">
          <strong>{won && !continued ? '2048! You did it!' : 'No more moves!'}</strong>
          <span>{won && !continued ? 'The big tile is yours.' : `Final score: ${score}`}</span>
          <div className="game-overlay-actions">
            {won && !continued && <button type="button" className="btn" onClick={() => { setContinued(true); setPrevious(null) }}>Keep going</button>}
            <button type="button" className="btn" onClick={restart}>Play again</button>
          </div>
        </div>}
      </div>
      <div className="dpad dpad-2048" aria-label="Touch controls">
        {DIRECTIONS.map((direction) => <button key={direction.id} type="button" title={direction.title} aria-label={direction.title} onClick={() => move(direction.id)}>{direction.label}</button>)}
      </div>
      <p className="game-hint">Use arrow keys or WASD. Matching tiles merge into one.</p>
    </section>
  )
}
