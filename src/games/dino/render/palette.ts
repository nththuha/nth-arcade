export const PALETTE_KEYS = ['bg', 'ink', 'cloud', 'eye'] as const

export type PaletteKey = (typeof PALETTE_KEYS)[number]
export type Palette = Record<PaletteKey, string>

export function readPalette(element: Element): Palette {
  const style = getComputedStyle(element)
  return Object.fromEntries(
    PALETTE_KEYS.map((key) => [key, style.getPropertyValue(`--${key}`).trim()]),
  ) as Palette
}
