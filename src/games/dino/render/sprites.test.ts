import { describe, expect, it } from 'vitest'
import { DINO } from '../config'
import { DINO_SPRITES } from './sprites'

describe('dino sprites', () => {
  it('have rectangular rows matching the collision sizes', () => {
    for (const [name, rows] of Object.entries(DINO_SPRITES)) {
      const width = rows[0].length
      expect(
        rows.every((row) => row.length === width),
        name,
      ).toBe(true)
      const ducking = name.startsWith('duck')
      expect(width * DINO.pixel).toBe(ducking ? DINO.duckWidth : DINO.width)
      expect(rows.length * DINO.pixel).toBe(ducking ? DINO.duckHeight : DINO.height)
    }
  })
})
