import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addRandom2048Tile,
  create2048Board,
  has2048Tile,
  is2048GameOver,
  move2048Board,
} from '../src/game2048.js'

const board = (rows) => rows.map((row) => [...row])

test('2048 starts with exactly two tiles', () => {
  const game = create2048Board(() => 0)
  assert.equal(game.flat().filter(Boolean).length, 2)
  assert.ok(game.flat().every((tile) => tile === 0 || tile === 2 || tile === 4))
})

test('2048 adds a tile into an empty cell without mutating the old board', () => {
  const initial = board([[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
  const next = addRandom2048Tile(initial, () => 0)
  assert.equal(next.flat().filter(Boolean).length, 2)
  assert.equal(initial.flat().filter(Boolean).length, 1)
})

test('left merges each pair once and reports score', () => {
  const result = move2048Board(board([[2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), 'left')
  assert.deepEqual(result.board[0], [4, 4, 0, 0])
  assert.equal(result.score, 8)
  assert.equal(result.changed, true)
})

test('a newly merged tile cannot merge again in the same move', () => {
  const result = move2048Board(board([[2, 2, 4, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), 'left')
  assert.deepEqual(result.board[0], [4, 4, 0, 0])
  assert.equal(result.score, 4)
})

test('right and vertical moves orient merges correctly', () => {
  const initial = board([[2, 2, 0, 0], [4, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]])
  const right = move2048Board(initial, 'right')
  assert.deepEqual(right.board[0], [0, 0, 0, 4])
  const down = move2048Board(initial, 'down')
  assert.deepEqual(down.board.map((row) => row[0]), [0, 0, 2, 8])
  assert.equal(down.score, 8)
})

test('unchanged moves are detected to prevent phantom tile spawns', () => {
  const initial = board([[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
  const result = move2048Board(initial, 'left')
  assert.equal(result.changed, false)
  assert.deepEqual(result.board, initial)
})

test('game-over checks empty space and all orthogonal neighbors', () => {
  assert.equal(is2048GameOver(board([[2, 4, 8, 16], [32, 64, 128, 256], [512, 1024, 2, 4], [8, 16, 32, 0]])), false)
  assert.equal(is2048GameOver(board([[2, 4, 8, 16], [32, 64, 128, 256], [512, 1024, 2, 4], [8, 16, 32, 64]])), true)
  assert.equal(is2048GameOver(board([[2, 4, 8, 16], [32, 32, 128, 256], [512, 1024, 2, 4], [8, 16, 32, 64]])), false)
})

test('win detection supports 2048 and higher tiles', () => {
  assert.equal(has2048Tile(board([[2, 4, 8, 16], [32, 64, 128, 256], [512, 1024, 2, 4], [8, 16, 32, 64]])), false)
  assert.equal(has2048Tile(board([[2, 4, 8, 16], [32, 64, 128, 256], [512, 1024, 2048, 4], [8, 16, 32, 64]])), true)
})

test('Game Center exposes the two new games and keyboard/touch affordances', async () => {
  const { readFile } = await import('node:fs/promises')
  const games = await readFile(new URL('../src/apps/Games.jsx', import.meta.url), 'utf8')
  const reaction = await readFile(new URL('../src/apps/ReactionRush.jsx', import.meta.url), 'utf8')
  const puzzle = await readFile(new URL('../src/apps/TwentyFortyEight.jsx', import.meta.url), 'utf8')
  assert.match(games, /Reaction Rush/)
  assert.match(games, /2048/)
  assert.match(reaction, /Personal best/)
  assert.match(puzzle, /Undo move/)
  assert.match(puzzle, /ArrowUp/)
})
