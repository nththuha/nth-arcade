import { describe, expect, it } from 'vitest'
import { aiMove } from '@/games/gomoku/logic/ai'
import { emptyBoard, winLine } from '@/games/gomoku/logic/game'

const put = (cells: [number, number, 1 | 2][]) => {
  const board = emptyBoard()
  for (const [r, c, p] of cells) board[r][c] = p
  return board
}

describe('winLine', () => {
  it('detects five in a row in every direction', () => {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]) {
      const board = put([0, 1, 2, 3, 4].map((i) => [5 + dr * i, 5 + dc * i, 1]))
      expect(winLine(board, 5 + dr * 2, 5 + dc * 2)).toHaveLength(5)
    }
  })

  it('does not accept four', () => {
    const board = put([0, 1, 2, 3].map((i) => [7, i, 1]))
    expect(winLine(board, 7, 3)).toBeNull()
  })

  it('counts overlines', () => {
    const board = put([0, 1, 2, 3, 4, 5].map((i) => [7, i, 2]))
    expect(winLine(board, 7, 2)).toHaveLength(6)
  })
})

describe('winLine blocked ends', () => {
  it('five blocked by the opponent on both ends does not win', () => {
    const board = put([0, 1, 2, 3, 4].map((i) => [7, i + 1, 1]))
    board[7][0] = 2
    board[7][6] = 2
    expect(winLine(board, 7, 3)).toBeNull()
  })

  it('five with one end blocked, or against the edge, still wins', () => {
    const board = put([0, 1, 2, 3, 4].map((i) => [7, i, 1]))
    board[7][5] = 2
    expect(winLine(board, 7, 2)).toHaveLength(5)
  })
})

describe('aiMove', () => {
  it('opens in the centre', () => {
    expect(aiMove(emptyBoard(), 2)).toEqual([7, 7])
  })

  it('completes its own five', () => {
    const board = put([0, 1, 2, 3].map((i) => [7, i, 2]))
    board[9][9] = 1
    expect(aiMove(board, 2)).toEqual([7, 4])
  })

  it('blocks an opponent four', () => {
    const board = put([0, 1, 2, 3].map((i) => [7, i + 3, 1]))
    board[0][0] = 2
    expect([
      [7, 2],
      [7, 7],
    ]).toContainEqual(aiMove(board, 2))
  })
})
