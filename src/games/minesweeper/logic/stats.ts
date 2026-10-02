import { BEST_TIMES_KEPT, RANKED_DIFFICULTIES } from '../config'
import type { DifficultyStats, RankedDifficulty, Stats } from '../types'

export function emptyDifficultyStats(): DifficultyStats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
    bestTimes: [],
  }
}

export function emptyStats(): Stats {
  return Object.fromEntries(
    RANKED_DIFFICULTIES.map((difficulty) => [difficulty, emptyDifficultyStats()]),
  ) as Stats
}

export function winPercentage(stats: DifficultyStats): number {
  return stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100)
}

export interface RecordResult {
  stats: Stats
  bestTimeRank: number | null
}

export function recordGame(
  stats: Stats,
  difficulty: RankedDifficulty,
  won: boolean,
  time: number,
  date: string,
): RecordResult {
  const prev = stats[difficulty]
  const currentStreak = won
    ? Math.max(prev.currentStreak, 0) + 1
    : Math.min(prev.currentStreak, 0) - 1

  let bestTimes = prev.bestTimes
  let bestTimeRank: number | null = null
  if (won) {
    const entry = { time, date }
    const merged = [...prev.bestTimes, entry].sort((a, b) => a.time - b.time)
    bestTimes = merged.slice(0, BEST_TIMES_KEPT)
    const rank = bestTimes.indexOf(entry)
    bestTimeRank = rank === -1 ? null : rank
  }

  const next: DifficultyStats = {
    played: prev.played + 1,
    won: prev.won + (won ? 1 : 0),
    currentStreak,
    longestWinStreak: Math.max(prev.longestWinStreak, currentStreak),
    longestLoseStreak: Math.max(prev.longestLoseStreak, -currentStreak),
    bestTimes,
  }
  return { stats: { ...stats, [difficulty]: next }, bestTimeRank }
}
