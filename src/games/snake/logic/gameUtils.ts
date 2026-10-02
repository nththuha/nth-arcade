import { DIRECTION_VECTORS, OPPOSITE_DIRECTIONS, type Direction, type Position } from '../types'

export function getNextHead(head: Position, direction: Direction): Position {
  const vector = DIRECTION_VECTORS[direction]
  return {
    row: head.row + vector.row,
    col: head.col + vector.col,
  }
}

export function isOutOfBounds(position: Position, boardSize: number): boolean {
  return (
    position.row < 0 || position.row >= boardSize || position.col < 0 || position.col >= boardSize
  )
}

export function wrapPosition(position: Position, boardSize: number): Position {
  return {
    row: ((position.row % boardSize) + boardSize) % boardSize,
    col: ((position.col % boardSize) + boardSize) % boardSize,
  }
}

export function isSelfCollision(head: Position, body: Position[]): boolean {
  return body.some((segment) => positionsEqual(head, segment))
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col
}

export function spawnFood(snake: Position[], boardSize: number): Position | null {
  const totalCells = boardSize * boardSize

  if (snake.length >= totalCells) {
    return null
  }

  const occupied = new Set(snake.map((p) => `${p.row},${p.col}`))
  const available: Position[] = []

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (!occupied.has(`${row},${col}`)) {
        available.push({ row, col })
      }
    }
  }

  return available[Math.floor(Math.random() * available.length)]
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return OPPOSITE_DIRECTIONS[current] !== next
}

export function calculateTickInterval(score: number, speed: number = 5): number {
  const baseInterval = 350 - speed * 30
  return Math.max(50, baseInterval - Math.floor(score / 5) * 5)
}
