export type CellState = 'hidden' | 'revealed' | 'flagged' | 'question'

export interface Cell {
  mine: boolean
  adjacent: number
  state: CellState
}

export interface BoardSize {
  rows: number
  cols: number
  mines: number
}

export interface Board extends BoardSize {
  cells: Cell[]
  minesPlaced: boolean
}

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export interface GameState {
  board: Board
  status: GameStatus
  explodedIndex: number | null
}

export type RankedDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type DifficultyId = RankedDifficulty | 'custom'

export interface Settings {
  difficulty: DifficultyId
  custom: BoardSize
  animations: boolean
  questionMarks: boolean
}

export interface BestTime {
  time: number
  date: string
}

export interface DifficultyStats {
  played: number
  won: number
  currentStreak: number
  longestWinStreak: number
  longestLoseStreak: number
  bestTimes: BestTime[]
}

export type Stats = Record<RankedDifficulty, DifficultyStats>
