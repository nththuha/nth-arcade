export type Phase = 'waiting' | 'running' | 'over'

export type ObstacleKind = 'cactus-small' | 'cactus-large' | 'bird'

export interface Obstacle {
  kind: ObstacleKind
  x: number
  y: number
  width: number
  height: number
  count: number
}

export interface Cloud {
  x: number
  y: number
}

export interface World {
  dinoY: number
  velocity: number
  ducking: boolean
  speed: number
  distance: number
  elapsed: number
  obstacles: Obstacle[]
  nextGap: number
  clouds: Cloud[]
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}
