import { describe, expect, it } from 'vitest'
import type { Board, Tiles } from '../types'
import { canMove, createRandomTile, lineCells, moveTiles } from './board'

function fromValues(values: number[][]): { board: Board; tiles: Tiles } {
  const tiles: Tiles = {}
  const board = values.map((row, r) =>
    row.map((value, c) => {
      if (!value) return null
      const id = `${r},${c}`
      tiles[id] = { id, value, currentPosition: [r, c] }
      return id
    }),
  )
  return { board, tiles }
}

function toValues(board: Board, tiles: Tiles): number[][] {
  return board.map((row) => row.map((id) => (id ? tiles[id].value : 0)))
}

function counter() {
  let n = 0
  return () => `new-${n++}`
}

describe('lineCells', () => {
  it('orders cells from the edge tiles slide toward', () => {
    expect(lineCells('left', 1)).toEqual([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ])
    expect(lineCells('right', 1)).toEqual([
      [1, 3],
      [1, 2],
      [1, 1],
      [1, 0],
    ])
    expect(lineCells('up', 2)).toEqual([
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ])
    expect(lineCells('down', 2)).toEqual([
      [3, 2],
      [2, 2],
      [1, 2],
      [0, 2],
    ])
  })
})

describe('moveTiles', () => {
  const start = [
    [2, 2, 4, 0],
    [0, 0, 0, 0],
    [4, 0, 4, 8],
    [2, 2, 2, 2],
  ]

  it('slides and merges to the left', () => {
    const { board, tiles } = fromValues(start)
    const result = moveTiles(board, tiles, 'left', counter())
    expect(toValues(result.board, result.tiles)).toEqual([
      [4, 4, 0, 0],
      [0, 0, 0, 0],
      [8, 8, 0, 0],
      [4, 4, 0, 0],
    ])
    expect(result.moved).toBe(true)
    expect(result.scoreGained).toBe(4 + 8 + 4 + 4)
  })

  it('slides and merges to the right', () => {
    const { board, tiles } = fromValues(start)
    const result = moveTiles(board, tiles, 'right', counter())
    expect(toValues(result.board, result.tiles)).toEqual([
      [0, 0, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 8, 8],
      [0, 0, 4, 4],
    ])
  })

  it('slides and merges up and down', () => {
    const { board, tiles } = fromValues([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 2],
    ])
    const up = moveTiles(board, tiles, 'up', counter())
    expect(toValues(up.board, up.tiles)).toEqual([
      [4, 0, 0, 2],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const down = moveTiles(board, tiles, 'down', counter())
    expect(toValues(down.board, down.tiles)).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 0, 0, 0],
      [8, 0, 0, 2],
    ])
  })

  it('merges each tile at most once per move', () => {
    const { board, tiles } = fromValues([
      [4, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const result = moveTiles(board, tiles, 'left', counter())
    expect(toValues(result.board, result.tiles)[0]).toEqual([4, 4, 0, 0])
  })

  it('reports no movement when nothing can slide', () => {
    const { board, tiles } = fromValues([
      [2, 4, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const result = moveTiles(board, tiles, 'left', counter())
    expect(result.moved).toBe(false)
    expect(result.scoreGained).toBe(0)
  })

  it('keeps merged source tiles for the merge animation', () => {
    const { board, tiles } = fromValues([
      [0, 2, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const result = moveTiles(board, tiles, 'left', counter())
    expect(result.tiles['0,1']).toMatchObject({
      isRemoved: true,
      currentPosition: [0, 0],
      previousPosition: [0, 1],
    })
    expect(result.tiles['0,3']).toMatchObject({
      isRemoved: true,
      currentPosition: [0, 0],
      previousPosition: [0, 3],
    })
    expect(result.tiles['new-0']).toMatchObject({
      value: 4,
      isMerged: true,
      currentPosition: [0, 0],
    })
  })

  it('flags the winning tile', () => {
    const { board, tiles } = fromValues([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(moveTiles(board, tiles, 'left', counter()).reachedWinningTile).toBe(true)
  })
})

describe('canMove', () => {
  it('is true with an empty cell', () => {
    const { board, tiles } = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 0],
    ])
    expect(canMove(board, tiles)).toBe(true)
  })

  it('is true with equal neighbors on a full board', () => {
    const { board, tiles } = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ])
    expect(canMove(board, tiles)).toBe(true)
  })

  it('is false when stuck', () => {
    const { board, tiles } = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ])
    expect(canMove(board, tiles)).toBe(false)
  })
})

describe('createRandomTile', () => {
  it('returns null on a full board', () => {
    const { board } = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ])
    expect(createRandomTile(board)).toBeNull()
  })

  it('only spawns on an empty cell', () => {
    const { board } = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 0, 2, 4],
      [4, 2, 4, 2],
    ])
    const tile = createRandomTile(board, counter())
    expect(tile?.currentPosition).toEqual([2, 1])
    expect([2, 4]).toContain(tile?.value)
  })
})
