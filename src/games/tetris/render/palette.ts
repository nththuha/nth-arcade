export const PALETTE_KEYS = [
  'board',
  'grid',
  'piece-i',
  'piece-o',
  'piece-t',
  'piece-s',
  'piece-z',
  'piece-j',
  'piece-l',
  'block-highlight',
  'block-shade',
  'flash',
] as const

export type PaletteKey = (typeof PALETTE_KEYS)[number]
export type Palette = Record<PaletteKey, string>

export function readPalette(element: Element): Palette {
  const style = getComputedStyle(element)
  return Object.fromEntries(
    PALETTE_KEYS.map((key) => [key, style.getPropertyValue(`--${key}`).trim()]),
  ) as Palette
}
