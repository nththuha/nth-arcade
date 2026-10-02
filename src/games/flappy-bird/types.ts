export type Phase = 'menu' | 'ready' | 'playing' | 'dying' | 'over'

export interface Pipe {
  x: number
  gapTop: number
  scored: boolean
}

export interface World {
  birdY: number
  velocity: number
  pipes: Pipe[]
  score: number
  distance: number
}
