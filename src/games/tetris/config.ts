import type { ClearKind, PieceType } from './types'

export const BOARD = { cols: 10, rows: 20, hidden: 2 }
export const TOTAL_ROWS = BOARD.rows + BOARD.hidden

export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
export const QUEUE_SIZE = 5
export const SPAWN = { x: 3, y: 1 }

export const LOCK = { delay: 0.5, maxResets: 15 }
export const SOFT_DROP_FACTOR = 20
export const MIN_SOFT_DROP_SECONDS = 0.03
export const LINES_PER_LEVEL = 10
export const MAX_LEVEL = 20

export const INPUT = { das: 0.17, arr: 0.05 }
export const MAX_FRAME_SECONDS = 0.1
export const FLASH_SECONDS = 0.25
export const POPUP_MS = 1200
export const RESTART_DELAY_MS = 400

export const POINTS = {
  softDrop: 1,
  hardDrop: 2,
  combo: 50,
  backToBack: 1.5,
  perfectClear: [0, 800, 1200, 1800, 2000],
}

export const CLEAR_POINTS: Record<ClearKind, number> = {
  single: 100,
  double: 300,
  triple: 500,
  tetris: 800,
  t_spin: 400,
  t_spin_single: 800,
  t_spin_double: 1200,
  t_spin_triple: 1600,
}

export const gravitySeconds = (level: number) =>
  Math.pow(0.8 - (Math.min(level, MAX_LEVEL) - 1) * 0.007, Math.min(level, MAX_LEVEL) - 1)
