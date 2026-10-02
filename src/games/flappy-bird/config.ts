export const WORLD = { width: 288, height: 512, groundY: 400 }

export const BIRD = { x: 72, radius: 11, pixel: 2 }

export const PHYSICS = {
  gravity: 1500,
  flapVelocity: -430,
  maxFallSpeed: 650,
}

export const PIPE = {
  width: 52,
  gap: 106,
  spacing: 168,
  speed: 125,
  minTop: 60,
  lipHeight: 24,
  lipOverhang: 3,
  firstX: WORLD.width + 80,
}

export const MEDALS = [
  { min: 40, medal: 'platinum' },
  { min: 30, medal: 'gold' },
  { min: 20, medal: 'silver' },
  { min: 10, medal: 'bronze' },
] as const

export type Medal = (typeof MEDALS)[number]['medal']

export const medalFor = (score: number): Medal | null =>
  MEDALS.find(({ min }) => score >= min)?.medal ?? null

export const MAX_FRAME_SECONDS = 1 / 30
export const RESTART_DELAY_MS = 500
