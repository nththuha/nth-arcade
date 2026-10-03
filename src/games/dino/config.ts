export const WORLD = { width: 600, height: 170, groundY: 150 }

export const DINO = {
  x: 40,
  width: 44,
  height: 44,
  duckWidth: 60,
  duckHeight: 22,
  pixel: 2,
}

export const PHYSICS = {
  gravity: 2160,
  jumpVelocity: 600,
  dropVelocity: 300,
  fastFallMultiplier: 3,
}

export const SPEED = {
  start: 360,
  max: 780,
  acceleration: 6,
  birdsFrom: 510,
  multiCactusFrom: 420,
}

export const OBSTACLES = {
  cactusSmall: { width: 17, height: 35 },
  cactusLarge: { width: 25, height: 50 },
  bird: { width: 46, height: 40 },
  birdClearances: [4, 20, 50],
  firstAfterSeconds: 1.2,
  gapBase: 72,
  gapRandom: 0.5,
}

export const CLOUDS = { width: 46, height: 14, speedRatio: 0.2, minY: 18, maxY: 70 }

export const SCORE_PER_PIXEL = 0.025
export const NIGHT_EVERY = 700
export const FLASH_EVERY = 100
export const MAX_FRAME_SECONDS = 1 / 30
export const RESTART_DELAY_MS = 500
