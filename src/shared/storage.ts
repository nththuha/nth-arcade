export const STORAGE_KEYS = {
  LANGUAGE: 'nth-arcade:language',
  BEST_2048: 'nth-arcade:2048:best-score',
  BEST_SNAKE: 'nth-arcade:snake:best-score',
  BEST_FLAPPY: 'nth-arcade:flappy-bird:best-score',
  BEST_DINO: 'nth-arcade:dino:best-score',
  MINESWEEPER_SETTINGS: 'nth-arcade:minesweeper:settings',
  MINESWEEPER_STATS: 'nth-arcade:minesweeper:stats',
}

export function loadString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export function loadNumber(key: string): number {
  const stored = loadString(key)
  return stored ? Math.max(0, Number(stored)) || 0 : 0
}

export function saveNumber(key: string, value: number): void {
  saveString(key, String(value))
}

export function loadJson<T extends object>(key: string, fallback: T): T {
  const stored = loadString(key)
  if (!stored) return fallback
  try {
    const parsed: unknown = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown): void {
  saveString(key, JSON.stringify(value))
}
