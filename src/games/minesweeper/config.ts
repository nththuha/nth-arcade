import type { BoardSize, RankedDifficulty, Settings } from './types'

export const DIFFICULTIES: Record<RankedDifficulty, BoardSize> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  advanced: { rows: 16, cols: 30, mines: 99 },
}

export const RANKED_DIFFICULTIES: RankedDifficulty[] = ['beginner', 'intermediate', 'advanced']

export const CUSTOM_LIMITS = {
  minRows: 9,
  maxRows: 24,
  minCols: 9,
  maxCols: 30,
  minMines: 10,
}

export const maxMines = (rows: number, cols: number) => (rows - 1) * (cols - 1)

export const MAX_TIME = 999
export const BEST_TIMES_KEPT = 5
export const LONG_PRESS_MS = 400
export const TOUCH_MOVE_TOLERANCE = 10

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'beginner',
  custom: { rows: 20, cols: 30, mines: 145 },
  animations: true,
  questionMarks: true,
}

export function clampCustom({ rows, cols, mines }: BoardSize): BoardSize {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)))
  const r = clamp(rows, CUSTOM_LIMITS.minRows, CUSTOM_LIMITS.maxRows)
  const c = clamp(cols, CUSTOM_LIMITS.minCols, CUSTOM_LIMITS.maxCols)
  return { rows: r, cols: c, mines: clamp(mines, CUSTOM_LIMITS.minMines, maxMines(r, c)) }
}

export function sizeOf(settings: Settings): BoardSize {
  return settings.difficulty === 'custom'
    ? clampCustom(settings.custom)
    : DIFFICULTIES[settings.difficulty]
}
