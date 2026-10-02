import { describe, expect, it } from 'vitest'
import { emptyStats, recordGame, winPercentage } from './stats'

const DATE = '2026-10-02T00:00:00.000Z'

describe('recordGame', () => {
  it('counts games, wins and streaks', () => {
    let stats = emptyStats()
    for (const won of [true, true, false, false, false, true]) {
      stats = recordGame(stats, 'beginner', won, 30, DATE).stats
    }
    const s = stats.beginner
    expect(s.played).toBe(6)
    expect(s.won).toBe(3)
    expect(s.longestWinStreak).toBe(2)
    expect(s.longestLoseStreak).toBe(3)
    expect(s.currentStreak).toBe(1)
    expect(winPercentage(s)).toBe(50)
    expect(stats.intermediate.played).toBe(0)
  })

  it('keeps the 5 best times, sorted, and reports the rank', () => {
    let stats = emptyStats()
    for (const time of [50, 40, 60, 30, 70]) {
      stats = recordGame(stats, 'advanced', true, time, DATE).stats
    }
    expect(stats.advanced.bestTimes.map((b) => b.time)).toEqual([30, 40, 50, 60, 70])

    const faster = recordGame(stats, 'advanced', true, 35, DATE)
    expect(faster.bestTimeRank).toBe(1)
    expect(faster.stats.advanced.bestTimes.map((b) => b.time)).toEqual([30, 35, 40, 50, 60])

    expect(recordGame(stats, 'advanced', true, 99, DATE).bestTimeRank).toBeNull()
    expect(recordGame(stats, 'advanced', false, 10, DATE).bestTimeRank).toBeNull()
  })
})
