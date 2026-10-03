import { describe, expect, it } from 'vitest'
import { BOARD, CLEAR_POINTS, LOCK, PIECE_TYPES, QUEUE_SIZE, TOTAL_ROWS } from '../config'
import type { Board, Game, PieceType } from '../types'
import {
  collides,
  emptyBoard,
  fillQueue,
  ghostY,
  hardDrop,
  holdPiece,
  move,
  newGame,
  pieceCells,
  rotate,
  spawnPiece,
  tick,
} from './game'
import { cellsOf } from './pieces'

const seeded =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

const fillRows = (board: Board, count: number, gapCol: number): Board =>
  board.map((row, y) =>
    y >= TOTAL_ROWS - count ? row.map((_, x) => (x === gapCol ? null : ('Z' as PieceType))) : row,
  )

const withPiece = (game: Game, type: PieceType, x = 3, y = 1): Game => ({
  ...game,
  piece: { ...spawnPiece(type), x, y },
})

describe('pieces', () => {
  it('has four cells in every rotation', () => {
    for (const type of PIECE_TYPES) {
      for (const rotation of [0, 1, 2, 3] as const) {
        expect(cellsOf(type, rotation)).toHaveLength(4)
      }
    }
  })

  it('rotates T clockwise around its center', () => {
    expect(cellsOf('T', 1)).toEqual([
      [2, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ])
  })
})

describe('7-bag', () => {
  it('deals every piece once per bag', () => {
    const queue = fillQueue([], seeded(7))
    expect(queue.length).toBeGreaterThan(QUEUE_SIZE)
    expect(new Set(queue.slice(0, 7)).size).toBe(7)
  })
})

describe('movement', () => {
  it('stops at the walls', () => {
    let game = withPiece(newGame(seeded()), 'O')
    for (let i = 0; i < 10; i++) game = move(game, -1)
    expect(Math.min(...pieceCells(game.piece).map(([x]) => x))).toBe(0)
    for (let i = 0; i < 10; i++) game = move(game, 1)
    expect(Math.max(...pieceCells(game.piece).map(([x]) => x))).toBe(BOARD.cols - 1)
  })

  it('kicks off the wall when rotating', () => {
    let game = withPiece(newGame(seeded()), 'I')
    game = rotate(game, 1)
    for (let i = 0; i < 10; i++) game = move(game, 1)
    const rotated = rotate(game, -1)
    expect(rotated.piece.rotation).toBe(0)
    expect(collides(rotated.board, rotated.piece)).toBe(false)
  })

  it('finds the landing row for the ghost piece', () => {
    const game = withPiece(newGame(seeded()), 'O')
    expect(ghostY(game)).toBe(TOTAL_ROWS - 2)
  })
})

describe('clearing lines', () => {
  it('scores a tetris with an I piece in the well', () => {
    let game = withPiece({ ...newGame(seeded()), board: fillRows(emptyBoard(), 4, 9) }, 'I')
    game = rotate(game, 1)
    for (let i = 0; i < 10; i++) game = move(game, 1)
    const before = game.score
    const dropDistance = ghostY(game) - game.piece.y
    game = hardDrop(game, seeded())
    expect(game.lines).toBe(4)
    expect(game.lastClear?.kind).toBe('tetris')
    expect(game.score - before).toBe(CLEAR_POINTS.tetris + dropDistance * 2 + 2000)
    expect(game.lastClear?.perfect).toBe(true)
    expect(game.board.flat().every((cell) => cell === null)).toBe(true)
  })

  it('detects a T-spin double', () => {
    const bottom = TOTAL_ROWS - 1
    const board = emptyBoard().map((row, y) =>
      row.map((_, x): PieceType | null => {
        if (y === bottom) return x === 4 ? null : 'J'
        if (y === bottom - 1) return x >= 3 && x <= 5 ? null : 'J'
        if (y === bottom - 2) return x === 3 ? 'J' : null
        return null
      }),
    )
    const game: Game = {
      ...newGame(seeded()),
      board,
      piece: { type: 'T', rotation: 2, x: 3, y: bottom - 2 },
      lastMoveRotate: true,
    }
    const result = hardDrop(game, seeded())
    expect(result.lastClear?.kind).toBe('t_spin_double')
    expect(result.lines).toBe(2)
    expect(result.score).toBe(CLEAR_POINTS.t_spin_double)
    expect(result.backToBack).toBe(true)
  })

  it('levels up every ten lines', () => {
    const game = { ...newGame(seeded()), lines: 9, board: fillRows(emptyBoard(), 1, 0) }
    let next = rotate(withPiece(game, 'I'), 1)
    for (let i = 0; i < 10; i++) next = move(next, -1)
    next = hardDrop(next, seeded())
    expect(next.lines).toBe(10)
    expect(next.level).toBe(2)
  })
})

describe('hold', () => {
  it('swaps once per piece', () => {
    const game = newGame(seeded())
    const first = game.piece.type
    const held = holdPiece(game, seeded())
    expect(held.hold).toBe(first)
    expect(held.canHold).toBe(false)
    expect(holdPiece(held, seeded())).toBe(held)
  })
})

describe('gravity and locking', () => {
  it('falls with gravity and locks after the lock delay', () => {
    let game = withPiece(newGame(seeded()), 'O')
    game = tick(game, 1.01, false)
    expect(game.piece.y).toBe(2)
    while (game.piece.type === 'O' && game.piece.y < ghostY(game)) game = tick(game, 0.05, true)
    const landed = tick(game, LOCK.delay / 2, false)
    expect(landed.piece.y).toBe(game.piece.y)
    const locked = tick(landed, LOCK.delay, false)
    expect(locked.board[TOTAL_ROWS - 1].filter(Boolean)).toHaveLength(2)
  })

  it('ends the game when a new piece cannot spawn', () => {
    const board = emptyBoard().map((row, y) =>
      y > 0 ? row.map((_, x) => (x === 0 ? null : ('Z' as PieceType))) : row,
    )
    const game = hardDrop(withPiece({ ...newGame(seeded()), board }, 'O', 3, 0), seeded())
    expect(game.over).toBe(true)
  })
})
