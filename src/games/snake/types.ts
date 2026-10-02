export interface Position {
  row: number
  col: number
}

export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]

export const DIRECTION_VECTORS: Record<Direction, Position> = {
  [Direction.UP]: { row: -1, col: 0 },
  [Direction.DOWN]: { row: 1, col: 0 },
  [Direction.LEFT]: { row: 0, col: -1 },
  [Direction.RIGHT]: { row: 0, col: 1 },
}

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
}

export const BOARD_SIZE = 20

export const INITIAL_SNAKE_LENGTH = 3

export const INITIAL_DIRECTION = Direction.RIGHT
