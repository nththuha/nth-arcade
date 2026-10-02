import { describe, expect, it } from 'vitest'
import type { GameState } from '../types'
import {
  chord,
  countFlags,
  createBoard,
  cycleMark,
  neighbors,
  placeMines,
  restartSameBoard,
  reveal,
  withMinesAt,
} from './board'

function gameWithMines(mines: number[], rows = 5, cols = 5): GameState {
  return {
    board: withMinesAt(createBoard({ rows, cols, mines: mines.length }), mines),
    status: 'ready',
    explodedIndex: null,
  }
}

const states = (game: GameState) => game.board.cells.map((cell) => cell.state)

describe('neighbors', () => {
  it('handles corners, edges and the middle', () => {
    expect(neighbors(0, 3, 3).sort()).toEqual([1, 3, 4])
    expect(neighbors(1, 3, 3).sort()).toEqual([0, 2, 3, 4, 5])
    expect(neighbors(4, 3, 3)).toHaveLength(8)
  })
})

describe('withMinesAt', () => {
  it('computes adjacent counts', () => {
    const board = withMinesAt(createBoard({ rows: 3, cols: 3, mines: 2 }), [0, 2])
    expect(board.cells.map((c) => (c.mine ? '*' : c.adjacent)).join('')).toBe('*2*121000')
  })
})

describe('placeMines', () => {
  it('keeps the first click and its neighbors free', () => {
    for (let seed = 0; seed < 20; seed++) {
      const board = placeMines(createBoard({ rows: 9, cols: 9, mines: 10 }), 40)
      expect(board.cells.filter((c) => c.mine)).toHaveLength(10)
      for (const i of [40, ...neighbors(40, 9, 9)]) expect(board.cells[i].mine).toBe(false)
    }
  })

  it('only keeps the clicked cell free when the board is too dense', () => {
    const board = placeMines(createBoard({ rows: 9, cols: 9, mines: 64 }), 40)
    expect(board.cells.filter((c) => c.mine)).toHaveLength(64)
    expect(board.cells[40].mine).toBe(false)
  })
})

describe('reveal', () => {
  it('places mines on the first click and starts the game', () => {
    const game = reveal(
      { board: createBoard({ rows: 9, cols: 9, mines: 10 }), status: 'ready', explodedIndex: null },
      0,
    )
    expect(game.board.minesPlaced).toBe(true)
    expect(game.board.cells[0].state).toBe('revealed')
    expect(['playing', 'won']).toContain(game.status)
  })

  it('flood-fills empty areas up to the numbers', () => {
    const game = reveal(gameWithMines([24]), 0)
    expect(game.status).toBe('won')
    expect(states(game).filter((s) => s === 'revealed')).toHaveLength(24)
  })

  const WALL = [2, 7, 12, 17, 22]

  it('stops at numbers', () => {
    const game = reveal(gameWithMines(WALL), 0)
    expect(game.status).toBe('playing')
    expect(game.board.cells[0].state).toBe('revealed')
    expect(game.board.cells[1].state).toBe('revealed')
    expect(game.board.cells[1].adjacent).toBe(2)
    expect(game.board.cells[3].state).toBe('hidden')
  })

  it('loses on a mine and remembers which one exploded', () => {
    const game = reveal(reveal(gameWithMines(WALL), 0), 12)
    expect(game.status).toBe('lost')
    expect(game.explodedIndex).toBe(12)
  })

  it('ignores flagged cells and finished games', () => {
    const flagged = cycleMark(gameWithMines(WALL), 0, true)
    expect(reveal(flagged, 0)).toBe(flagged)
    const lost = reveal(reveal(gameWithMines(WALL), 0), 12)
    expect(reveal(lost, 3)).toBe(lost)
  })

  it('flags every mine on a win', () => {
    const game = reveal(gameWithMines([24]), 0)
    expect(game.board.cells[24].state).toBe('flagged')
    expect(countFlags(game.board)).toBe(1)
  })
})

describe('cycleMark', () => {
  it('cycles hidden → flag → question → hidden', () => {
    let game = gameWithMines([12])
    game = cycleMark(game, 0, true)
    expect(game.board.cells[0].state).toBe('flagged')
    game = cycleMark(game, 0, true)
    expect(game.board.cells[0].state).toBe('question')
    game = cycleMark(game, 0, true)
    expect(game.board.cells[0].state).toBe('hidden')
  })

  it('skips the question mark when disabled', () => {
    let game = cycleMark(gameWithMines([12]), 0, false)
    game = cycleMark(game, 0, false)
    expect(game.board.cells[0].state).toBe('hidden')
  })
})

describe('chord', () => {
  const mines = [6, 18]

  it('opens the other neighbors when the flags match the number', () => {
    let game = reveal(gameWithMines(mines), 12)
    expect(game.board.cells[12].adjacent).toBe(2)
    game = cycleMark(game, 6, true)
    game = cycleMark(game, 18, true)
    game = chord(game, 12)
    for (const n of neighbors(12, 5, 5).filter((n) => !mines.includes(n))) {
      expect(game.board.cells[n].state).toBe('revealed')
    }
  })

  it('does nothing when the flag count does not match', () => {
    let game = reveal(gameWithMines(mines), 12)
    game = cycleMark(game, 6, true)
    expect(chord(game, 12)).toBe(game)
  })

  it('loses when a flag is wrong', () => {
    let game = reveal(gameWithMines(mines), 12)
    game = cycleMark(game, 6, true)
    game = cycleMark(game, 7, true)
    game = chord(game, 12)
    expect(game.status).toBe('lost')
    expect(game.explodedIndex).toBe(18)
  })

  it('is triggered by revealing a revealed number', () => {
    let game = reveal(gameWithMines(mines), 12)
    game = cycleMark(game, 6, true)
    game = cycleMark(game, 18, true)
    expect(reveal(game, 12).board.cells[7].state).toBe('revealed')
  })
})

describe('restartSameBoard', () => {
  it('keeps the mines and covers every cell again', () => {
    const lost = reveal(reveal(gameWithMines([2, 7, 12, 17, 22]), 0), 12)
    const game = restartSameBoard(lost)
    expect(game.status).toBe('ready')
    expect(game.board.minesPlaced).toBe(true)
    expect(states(game).every((s) => s === 'hidden')).toBe(true)
    expect(game.board.cells[12].mine).toBe(true)
  })
})
