export const STORAGE_KEYS = {
  LANGUAGE: 'nth-arcade:language',
  BEST_2048: 'nth-arcade:2048:best-score',
  BEST_SNAKE: 'nth-arcade:snake:best-score',
} as const

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
  } catch {
    // localStorage unavailable
  }
}

export function loadNumber(key: string): number {
  const stored = loadString(key)
  return stored ? Math.max(0, Number(stored)) || 0 : 0
}

export function saveNumber(key: string, value: number): void {
  saveString(key, String(value))
}
