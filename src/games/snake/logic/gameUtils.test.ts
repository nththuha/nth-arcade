import { describe, expect, it } from 'vitest'
import { Direction } from '../types'
import {
  calculateTickInterval,
  getNextHead,
  isOutOfBounds,
  isSelfCollision,
  isValidDirectionChange,
  positionsEqual,
  spawnFood,
  wrapPosition,
} from './gameUtils'

describe('getNextHead', () => {
  it('moves one cell in the given direction', () => {
    const head = { row: 5, col: 5 }
    expect(getNextHead(head, Direction.UP)).toEqual({ row: 4, col: 5 })
    expect(getNextHead(head, Direction.DOWN)).toEqual({ row: 6, col: 5 })
    expect(getNextHead(head, Direction.LEFT)).toEqual({ row: 5, col: 4 })
    expect(getNextHead(head, Direction.RIGHT)).toEqual({ row: 5, col: 6 })
  })
})

describe('wrapPosition', () => {
  it('wraps through every wall', () => {
    expect(wrapPosition({ row: -1, col: 3 }, 20)).toEqual({ row: 19, col: 3 })
    expect(wrapPosition({ row: 20, col: 3 }, 20)).toEqual({ row: 0, col: 3 })
    expect(wrapPosition({ row: 3, col: -1 }, 20)).toEqual({ row: 3, col: 19 })
    expect(wrapPosition({ row: 3, col: 20 }, 20)).toEqual({ row: 3, col: 0 })
  })
})

describe('isOutOfBounds', () => {
  it('detects positions outside the board', () => {
    expect(isOutOfBounds({ row: 0, col: 0 }, 20)).toBe(false)
    expect(isOutOfBounds({ row: 19, col: 19 }, 20)).toBe(false)
    expect(isOutOfBounds({ row: -1, col: 0 }, 20)).toBe(true)
    expect(isOutOfBounds({ row: 0, col: 20 }, 20)).toBe(true)
  })
})

describe('collisions', () => {
  it('compares positions and detects self collision', () => {
    const body = [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ]
    expect(positionsEqual({ row: 1, col: 2 }, { row: 1, col: 2 })).toBe(true)
    expect(isSelfCollision({ row: 1, col: 2 }, body)).toBe(true)
    expect(isSelfCollision({ row: 2, col: 2 }, body)).toBe(false)
  })
})

describe('spawnFood', () => {
  it('never spawns on the snake', () => {
    const snake = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ]
    for (let i = 0; i < 50; i++) {
      expect(spawnFood(snake, 2)).toEqual({ row: 1, col: 1 })
    }
  })

  it('returns null when the board is full', () => {
    const snake = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ]
    expect(spawnFood(snake, 2)).toBeNull()
  })
})

describe('isValidDirectionChange', () => {
  it('rejects 180° reversals only', () => {
    expect(isValidDirectionChange(Direction.RIGHT, Direction.LEFT)).toBe(false)
    expect(isValidDirectionChange(Direction.UP, Direction.DOWN)).toBe(false)
    expect(isValidDirectionChange(Direction.RIGHT, Direction.UP)).toBe(true)
    expect(isValidDirectionChange(Direction.RIGHT, Direction.RIGHT)).toBe(true)
  })
})

describe('calculateTickInterval', () => {
  it('gets faster with speed and score but never below 50ms', () => {
    expect(calculateTickInterval(0, 1)).toBe(320)
    expect(calculateTickInterval(0, 5)).toBe(200)
    expect(calculateTickInterval(10, 5)).toBe(190)
    expect(calculateTickInterval(0, 10)).toBe(50)
    expect(calculateTickInterval(1000, 5)).toBe(50)
  })
})
