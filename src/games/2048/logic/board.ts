import { INITIAL_TILES, SIZE, WINNING_TILE } from '../config'
import type { Board, Direction, Position, TileProps, Tiles } from '../types'

export type IdFactory = () => string

const defaultId: IdFactory = () => crypto.randomUUID()

export function createEmptyBoard(size = SIZE): Board {
  return Array.from({ length: size }, () => Array<string | null>(size).fill(null))
}

export function createRandomTile(
  board: Board,
  createId: IdFactory = defaultId,
  random: () => number = Math.random,
): TileProps | null {
  const emptyCells: Position[] = []
  board.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell === null) emptyCells.push([i, j])
    }),
  )
  if (emptyCells.length === 0) return null

  const [row, col] = emptyCells[Math.floor(random() * emptyCells.length)]
  const value = random() < 0.9 ? 2 : 4
  return { id: createId(), currentPosition: [row, col], value, isMerged: false, isRemoved: false }
}

export function initializeGame(createId: IdFactory = defaultId): { board: Board; tiles: Tiles } {
  const board = createEmptyBoard()
  const tiles: Tiles = {}
  for (let i = 0; i < INITIAL_TILES; i++) {
    const tile = createRandomTile(board, createId)
    if (tile) {
      board[tile.currentPosition[0]][tile.currentPosition[1]] = tile.id
      tiles[tile.id] = tile
    }
  }
  return { board, tiles }
}

export function canMove(board: Board, tiles: Tiles): boolean {
  const size = board.length
  const valueAt = (i: number, j: number) => {
    const id = board[i][j]
    return id ? (tiles[id]?.value ?? null) : null
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const value = valueAt(i, j)
      if (value === null) return true
      if (j < size - 1 && value === valueAt(i, j + 1)) return true
      if (i < size - 1 && value === valueAt(i + 1, j)) return true
    }
  }
  return false
}

export function lineCells(direction: Direction, index: number, size = SIZE): Position[] {
  return Array.from({ length: size }, (_, k): Position => {
    switch (direction) {
      case 'left':
        return [index, k]
      case 'right':
        return [index, size - 1 - k]
      case 'up':
        return [k, index]
      case 'down':
        return [size - 1 - k, index]
    }
  })
}

export interface MoveResult {
  board: Board
  tiles: Tiles
  moved: boolean
  scoreGained: number
  reachedWinningTile: boolean
}

export function moveTiles(
  board: Board,
  tiles: Tiles,
  direction: Direction,
  createId: IdFactory = defaultId,
): MoveResult {
  const size = board.length
  const newBoard = createEmptyBoard(size)
  const newTiles: Tiles = {}
  let moved = false
  let scoreGained = 0
  let reachedWinningTile = false

  for (let line = 0; line < size; line++) {
    const cells = lineCells(direction, line, size)
    const ids = cells.map(([r, c]) => board[r][c]).filter((id): id is string => id !== null)
    let target = 0

    for (let j = 0; j < ids.length; target++) {
      const [row, col] = cells[target]
      const id = ids[j]
      const nextId = ids[j + 1]

      if (nextId !== undefined && tiles[id].value === tiles[nextId].value) {
        const mergedValue = tiles[id].value * 2
        const mergedId = createId()
        scoreGained += mergedValue
        if (mergedValue === WINNING_TILE) reachedWinningTile = true

        newTiles[mergedId] = {
          id: mergedId,
          currentPosition: [row, col],
          value: mergedValue,
          isMerged: true,
          isRemoved: false,
        }
        for (const sourceId of [id, nextId]) {
          newTiles[sourceId] = {
            ...tiles[sourceId],
            previousPosition: tiles[sourceId].currentPosition,
            currentPosition: [row, col],
            isMerged: false,
            isRemoved: true,
          }
        }
        newBoard[row][col] = mergedId
        moved = true
        j += 2
      } else {
        const [prevRow, prevCol] = tiles[id].currentPosition
        if (prevRow !== row || prevCol !== col) moved = true

        newTiles[id] = {
          ...tiles[id],
          previousPosition: tiles[id].currentPosition,
          currentPosition: [row, col],
          isMerged: false,
          isRemoved: false,
        }
        newBoard[row][col] = id
        j++
      }
    }
  }

  return { board: newBoard, tiles: newTiles, moved, scoreGained, reachedWinningTile }
}
