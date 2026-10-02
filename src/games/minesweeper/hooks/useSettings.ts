import { STORAGE_KEYS, loadJson, saveJson } from '@/shared/storage'
import { useState } from 'react'
import { DEFAULT_SETTINGS, DIFFICULTIES, clampCustom } from '../config'
import type { Settings } from '../types'

function loadSettings(): Settings {
  const stored = loadJson(STORAGE_KEYS.MINESWEEPER_SETTINGS, DEFAULT_SETTINGS)
  const validDifficulty = stored.difficulty === 'custom' || stored.difficulty in DIFFICULTIES
  return {
    ...stored,
    difficulty: validDifficulty ? stored.difficulty : DEFAULT_SETTINGS.difficulty,
    custom: clampCustom({ ...DEFAULT_SETTINGS.custom, ...stored.custom }),
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings)

  const updateSettings = (next: Settings) => {
    setSettings(next)
    saveJson(STORAGE_KEYS.MINESWEEPER_SETTINGS, next)
  }

  return [settings, updateSettings] as const
}

export { loadSettings }
