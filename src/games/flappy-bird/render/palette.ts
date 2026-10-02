export const PALETTE_KEYS = [
  'sky',
  'cloud',
  'cloud-shade',
  'city',
  'city-shade',
  'city-window',
  'bush',
  'bush-shade',
  'ground',
  'ground-edge',
  'ground-stripe-light',
  'ground-stripe-dark',
  'ground-line',
  'ground-shade',
  'pipe',
  'pipe-light',
  'pipe-highlight',
  'pipe-dark',
  'pipe-outline',
  'bird-outline',
  'bird-body',
  'bird-body-light',
  'bird-belly',
  'bird-eye',
  'bird-pupil',
  'bird-beak',
  'bird-beak-dark',
  'bird-wing',
] as const

export type PaletteKey = (typeof PALETTE_KEYS)[number]
export type Palette = Record<PaletteKey, string>

export function readPalette(element: Element): Palette {
  const style = getComputedStyle(element)
  return Object.fromEntries(
    PALETTE_KEYS.map((key) => [key, style.getPropertyValue(`--${key}`).trim()]),
  ) as Palette
}
