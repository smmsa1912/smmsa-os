import { useEffect, useRef, useState } from 'react'

const N = 16
const CELL = 20
const SPEEDS = { chill: 165, classic: 120, turbo: 82 }
const COLORS = { bg: '#0d0b1a', grid: '#171433', snake: '#3ddc97', head: '#f6f5fb', food: '#ff6fae' }

const same = (a, b) => a.x === b.x && a.y === b.y

function placeFood(snake) {
  const open = []
  for (let x = 0; x < N; x += 1) {
    for (let y = 0; y < N; y += 1) {
      if (!snake.some((segment) => same(segment, { x, y }))) open.push({ x, y })
    }
  }
  return open.length ? open[Math.floor(Math.random() * open.length)] : null
}

function freshGame() {
  const snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }]
  return { snake, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: placeFood(snake), score: 0 }
}

function draw(canvas, game) {
  const ctx = canvas?.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, N * CELL, N * CELL)
  ctx.fillStyle = COLORS.grid
  for (let x = 0; x < N; x += 1) {
    for (let y = 0; y < N; y += 1) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
    }
  }
  if (game.food) {
    ctx.fillStyle = COLORS.food
    ctx.fillRect(game.food.x * CELL + 3, game.food.y * CELL + 3, CELL - 6, CELL - 6)
  }
  game.snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? COLORS.head : COLORS.snake
    ctx.fillRect(segment.x * CELL + 1, segment.y * CELL + 1, CELL - 2, CELL - 2)
    if (index === 0) {
      ctx.fillStyle = COLORS.bg
      ctx.fillRect(segment.x * CELL + 5, segment.y * CELL + 5, 3, 3)
      ctx.fillRect(segment.x * CELL + 12, segment.y * CELL + 5, 3, 3)
    }
  })
}

const loadBest = () => {
  try { return Number(localStorage.getItem('smmsa-snake-best')) || 0 } catch { return 0 }
}

export default function Snake({ focused }) {
  const canvas = useRef(null)
  const game = useRef(null)
  const touchStart = useRef(null)
  const [status, setStatus] = useState('idle')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(loadBest)
  const [speed, setSpeed] = useState('classic')

  const start = () => {
    game.current = freshGame()
    setScore(0)
    setStatus('running')
    draw(canvas.current, game.current)
  }

  const turn = (dx, dy) => {
    const current = game.current
    if (status !== 'running' || !current) return
    if (dx === -current.dir.x && dy === -current.dir.y) return
    current.next = { x: dx, y: dy }
  }

  const pauseOrResume = () => {
    if (status === 'running') setStatus('paused')
    else if (status === 'paused') setStatus('running')
  }

  useEffect(() => {
    game.current = freshGame()
    draw(canvas.current, game.current)
  }, [])

  useEffect(() => {
    if (status !== 'running' || !focused) return undefined
    const id = setInterval(() => {
      const current = game.current
      if (!current) return
      current.dir = current.next
      const head = { x: current.snake[0].x + current.dir.x, y: current.snake[0].y + current.dir.y }
      const hitWall = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N
      if (hitWall || current.snake.slice(0, -1).some((segment) => same(segment, head))) {
        setStatus('over')
        if (current.score > best) {
          setBest(current.score)
          try { localStorage.setItem('smmsa-snake-best', String(current.score)) } catch { /* Best score remains in memory. */ }
        }
        return
      }
      current.snake.unshift(head)
      if (current.food && same(head, current.food)) {
        current.score += 1
        setScore(current.score)
        current.food = placeFood(current.snake)
        if (!current.food) {
          setStatus('over')
          return
        }
      } else {
        current.snake.pop()
      }
      draw(canvas.current, current)
    }, SPEEDS[speed])
    return () => clearInterval(id)
  }, [status, focused, best, speed])

  useEffect(() => {
    if (!focused) return undefined
    const keys = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
    }
    const onKey = (event) => {
      if (event.target.closest?.('input, textarea, select')) return
      const direction = keys[event.key]
      if (direction) {
        event.preventDefault()
        if (status === 'running') turn(...direction)
        else if (status === 'idle' || status === 'over') start()
      } else if (event.key === ' ' || event.key.toLowerCase() === 'p') {
        event.preventDefault()
        if (status === 'running' || status === 'paused') pauseOrResume()
        else start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onTouchStart = (event) => {
    const touch = event.changedTouches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = (event) => {
    const startPoint = touchStart.current
    if (!startPoint) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - startPoint.x
    const dy = touch.clientY - startPoint.y
    touchStart.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0)
    else turn(0, dy > 0 ? 1 : -1)
  }

  return (
    <div className="game arcade-game snake-game">
      <div className="game-intro">
        <div><span className="game-kicker">CLASSIC MODE</span><h3>Snake</h3><p>Eat the pink pixels. Don't hit the wall—or yourself.</p></div>
        <div className="game-stats"><span>Score <strong>{score}</strong></span><span>Best <strong>{best}</strong></span></div>
      </div>
      <div className="game-controls-row snake-settings">
        <label className="game-select-label">Speed
          <select className="game-select" value={speed} onChange={(event) => setSpeed(event.target.value)} aria-label="Snake speed">
            <option value="chill">Chill</option><option value="classic">Classic</option><option value="turbo">Turbo</option>
          </select>
        </label>
        <button type="button" className="btn btn-muted" onClick={pauseOrResume} disabled={status === 'idle' || status === 'over'}>{status === 'paused' ? 'Resume' : 'Pause'}</button>
      </div>
      <div className="board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <canvas ref={canvas} width={N * CELL} height={N * CELL} aria-label={`Snake game board. Score ${score}.`} />
        {status !== 'running' && (
          <div className="board-msg">
            {status === 'over' && <><strong>GAME OVER</strong><p>Score {score} · Best {best}</p></>}
            {status === 'paused' && <strong>PAUSED</strong>}
            {status === 'idle' && <><strong>READY PLAYER ONE?</strong><p>Collect the pixels.</p></>}
            <button type="button" className="btn" onClick={status === 'paused' ? pauseOrResume : start}>{status === 'over' ? 'Play again' : status === 'paused' ? 'Resume' : 'Start game'}</button>
            <p className="small">Arrow keys / WASD · Space to pause</p>
          </div>
        )}
        {status === 'running' && !focused && <div className="board-msg"><strong>PAUSED</strong><p>Return to this window to continue.</p></div>}
      </div>
      <div className="dpad dpad-snake" aria-label="Touch controls">
        <button type="button" onClick={() => turn(0, -1)} aria-label="Up">↑</button>
        <button type="button" onClick={() => turn(-1, 0)} aria-label="Left">←</button>
        <button type="button" onClick={() => turn(1, 0)} aria-label="Right">→</button>
        <button type="button" onClick={() => turn(0, 1)} aria-label="Down">↓</button>
      </div>
    </div>
  )
}
