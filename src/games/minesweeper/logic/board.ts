import type { Board, BoardSize, Cell, GameState } from '../types'

export function neighbors(index: number, rows: number, cols: number): number[] {
  const row = Math.floor(index / cols)
  const col = index % cols
  const result: number[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c)
    }
  }
  return result
}

export function createBoard({ rows, cols, mines }: BoardSize): Board {
  const cells: Cell[] = Array.from({ length: rows * cols }, () => ({
    mine: false,
    adjacent: 0,
    state: 'hidden',
  }))
  return { rows, cols, mines, cells, minesPlaced: false }
}

export function newGame(size: BoardSize): GameState {
  return { board: createBoard(size), status: 'ready', explodedIndex: null }
}

export function withMinesAt(board: Board, mineIndexes: Iterable<number>): Board {
  const mineSet = new Set(mineIndexes)
  const cells = board.cells.map((cell, i) => ({ ...cell, mine: mineSet.has(i), adjacent: 0 }))
  cells.forEach((cell, i) => {
    cell.adjacent = neighbors(i, board.rows, board.cols).filter((n) => mineSet.has(n)).length
  })
  return { ...board, mines: mineSet.size, cells, minesPlaced: true }
}

export function placeMines(board: Board, safeIndex: number, random = Math.random): Board {
  const total = board.rows * board.cols
  const safeZone = new Set([safeIndex, ...neighbors(safeIndex, board.rows, board.cols)])
  const excluded = total - safeZone.size >= board.mines ? safeZone : new Set([safeIndex])

  const candidates: number[] = []
  for (let i = 0; i < total; i++) if (!excluded.has(i)) candidates.push(i)

  for (let i = 0; i < board.mines; i++) {
    const j = i + Math.floor(random() * (candidates.length - i))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  return withMinesAt(board, candidates.slice(0, board.mines))
}

export function countFlags(board: Board): number {
  return board.cells.filter((cell) => cell.state === 'flagged').length
}

function isFinished(game: GameState) {
  return game.status === 'won' || game.status === 'lost'
}

function openCells(game: GameState, start: number[]): GameState {
  const { board } = game
  const cells = [...board.cells]
  const queue = [...start]
  let explodedIndex: number | null = null

  while (queue.length > 0) {
    const index = queue.shift()!
    const cell = cells[index]
    if (cell.state === 'revealed' || cell.state === 'flagged') continue

    cells[index] = { ...cell, state: 'revealed' }
    if (cell.mine) {
      explodedIndex ??= index
      continue
    }
    if (cell.adjacent === 0) {
      for (const n of neighbors(index, board.rows, board.cols)) {
        const next = cells[n]
        if (!next.mine && (next.state === 'hidden' || next.state === 'question')) queue.push(n)
      }
    }
  }

  const nextBoard = { ...board, cells }
  if (explodedIndex !== null) {
    return { board: nextBoard, status: 'lost', explodedIndex }
  }

  const safeCells = board.rows * board.cols - board.mines
  const revealed = cells.filter((cell) => cell.state === 'revealed').length
  if (revealed === safeCells) {
    const flagged = cells.map((cell) =>
      cell.mine && cell.state !== 'flagged' ? { ...cell, state: 'flagged' as const } : cell,
    )
    return { board: { ...nextBoard, cells: flagged }, status: 'won', explodedIndex: null }
  }
  return { board: nextBoard, status: 'playing', explodedIndex: null }
}

export function reveal(game: GameState, index: number, random = Math.random): GameState {
  if (isFinished(game)) return game
  const cell = game.board.cells[index]
  if (cell.state === 'revealed') return chord(game, index)
  if (cell.state === 'flagged') return game

  const board = game.board.minesPlaced ? game.board : placeMines(game.board, index, random)
  return openCells({ ...game, board }, [index])
}

export function chord(game: GameState, index: number): GameState {
  if (isFinished(game)) return game
  const { board } = game
  const cell = board.cells[index]
  if (cell.state !== 'revealed' || cell.adjacent === 0) return game

  const around = neighbors(index, board.rows, board.cols)
  const flags = around.filter((n) => board.cells[n].state === 'flagged').length
  if (flags !== cell.adjacent) return game

  const toOpen = around.filter((n) => {
    const state = board.cells[n].state
    return state === 'hidden' || state === 'question'
  })
  return toOpen.length > 0 ? openCells(game, toOpen) : game
}

export function cycleMark(game: GameState, index: number, allowQuestion: boolean): GameState {
  if (isFinished(game)) return game
  const cell = game.board.cells[index]
  if (cell.state === 'revealed') return game

  const nextState =
    cell.state === 'hidden'
      ? 'flagged'
      : cell.state === 'flagged'
        ? allowQuestion
          ? 'question'
          : 'hidden'
        : 'hidden'

  const cells = [...game.board.cells]
  cells[index] = { ...cell, state: nextState }
  return { ...game, board: { ...game.board, cells } }
}

export function restartSameBoard(game: GameState): GameState {
  const cells = game.board.cells.map((cell) => ({ ...cell, state: 'hidden' as const }))
  return { board: { ...game.board, cells }, status: 'ready', explodedIndex: null }
}
