export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type Rotation = 0 | 1 | 2 | 3

export type Cell = PieceType | null

export type Board = Cell[][]

export interface Piece {
  type: PieceType
  rotation: Rotation
  x: number
  y: number
}

export type ClearKind =
  | 'single'
  | 'double'
  | 'triple'
  | 'tetris'
  | 't_spin'
  | 't_spin_single'
  | 't_spin_double'
  | 't_spin_triple'

export interface ClearEvent {
  id: number
  kind: ClearKind
  rows: number[]
  points: number
  combo: number
  backToBack: boolean
  perfect: boolean
}

export interface Game {
  board: Board
  piece: Piece
  hold: PieceType | null
  canHold: boolean
  queue: PieceType[]
  score: number
  lines: number
  level: number
  combo: number
  backToBack: boolean
  gravityTimer: number
  lockTimer: number
  lockResets: number
  lowestY: number
  lastMoveRotate: boolean
  lastClear: ClearEvent | null
  over: boolean
}

export type Phase = 'ready' | 'playing' | 'paused' | 'over'
