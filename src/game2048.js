export const GRID_SIZE = 4

export function create2048Board(random = Math.random) {
  let board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
  board = addRandom2048Tile(board, random)
  board = addRandom2048Tile(board, random)
  return board
}

export function addRandom2048Tile(board, random = Math.random) {
  const next = board.map((row) => [...row])
  const empty = []
  next.forEach((row, y) => row.forEach((value, x) => {
    if (value === 0) empty.push({ x, y })
  }))
  if (!empty.length) return next
  const position = empty[Math.min(empty.length - 1, Math.floor(random() * empty.length))]
  next[position.y][position.x] = random() < 0.9 ? 2 : 4
  return next
}

function compressAndMerge(line) {
  const values = line.filter(Boolean)
  const merged = []
  let gained = 0
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      const value = values[i] * 2
      merged.push(value)
      gained += value
      i += 1
    } else {
      merged.push(values[i])
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0)
  return { line: merged, gained }
}

export function move2048Board(board, direction) {
  if (!['left', 'right', 'up', 'down'].includes(direction)) {
    throw new Error(`Unsupported 2048 direction: ${direction}`)
  }
  const next = board.map((row) => [...row])
  let score = 0
  const horizontal = direction === 'left' || direction === 'right'
  const reverse = direction === 'right' || direction === 'down'
  const lines = Array.from({ length: GRID_SIZE }, (_, index) => {
    const line = horizontal
      ? [...next[index]]
      : next.map((row) => row[index])
    return reverse ? line.reverse() : line
  })
  const movedLines = lines.map((line) => {
    const result = compressAndMerge(line)
    score += result.gained
    return reverse ? result.line.reverse() : result.line
  })
  if (horizontal) {
    movedLines.forEach((row, y) => { next[y] = row })
  } else {
    movedLines.forEach((column, x) => {
      column.forEach((value, y) => { next[y][x] = value })
    })
  }
  return {
    board: next,
    score,
    changed: next.some((row, y) => row.some((value, x) => value !== board[y][x])),
  }
}

export function has2048Tile(board) {
  return board.some((row) => row.some((value) => value >= 2048))
}

export function is2048GameOver(board) {
  if (board.some((row) => row.some((value) => value === 0))) return false
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (x < GRID_SIZE - 1 && board[y][x] === board[y][x + 1]) return false
      if (y < GRID_SIZE - 1 && board[y][x] === board[y + 1][x]) return false
    }
  }
  return true
}
