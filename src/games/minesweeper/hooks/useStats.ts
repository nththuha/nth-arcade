import { STORAGE_KEYS, loadJson, saveJson } from '@/shared/storage'
import { useState } from 'react'
import { emptyDifficultyStats, emptyStats } from '../logic/stats'
import type { Stats } from '../types'

export function loadStats(): Stats {
  const stored = loadJson(STORAGE_KEYS.MINESWEEPER_STATS, emptyStats())
  const defaults = emptyStats()
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      { ...emptyDifficultyStats(), ...stored[key as keyof Stats] },
    ]),
  ) as Stats
}

export function useStats() {
  const [stats, setStats] = useState(loadStats)

  const updateStats = (next: Stats) => {
    setStats(next)
    saveJson(STORAGE_KEYS.MINESWEEPER_STATS, next)
  }

  return [stats, updateStats] as const
}
