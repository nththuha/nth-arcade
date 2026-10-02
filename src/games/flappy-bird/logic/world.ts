import { BIRD, PHYSICS, PIPE, WORLD } from '../config'
import type { Pipe, World } from '../types'

export const READY_Y = WORLD.groundY * 0.55

export function newWorld(): World {
  return { birdY: READY_Y, velocity: 0, pipes: [], score: 0, distance: 0 }
}

export function randomGapTop(random: () => number = Math.random): number {
  const max = WORLD.groundY - PIPE.gap - PIPE.minTop
  return Math.round(PIPE.minTop + random() * (max - PIPE.minTop))
}

export function flap(world: World): World {
  return { ...world, velocity: PHYSICS.flapVelocity }
}

export function fall(world: World, dt: number): World {
  const velocity = Math.min(PHYSICS.maxFallSpeed, world.velocity + PHYSICS.gravity * dt)
  const birdY = Math.max(
    BIRD.radius,
    Math.min(WORLD.groundY - BIRD.radius, world.birdY + velocity * dt),
  )
  return { ...world, velocity: birdY === BIRD.radius ? Math.max(0, velocity) : velocity, birdY }
}

export function hitsGround(world: World): boolean {
  return world.birdY + BIRD.radius >= WORLD.groundY
}

function circleHitsRect(
  cx: number,
  cy: number,
  r: number,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const nearestX = Math.max(x, Math.min(cx, x + w))
  const nearestY = Math.max(y, Math.min(cy, y + h))
  return (cx - nearestX) ** 2 + (cy - nearestY) ** 2 < r * r
}

export function hitsPipe(birdY: number, pipe: Pipe): boolean {
  const left = pipe.x - PIPE.lipOverhang
  const width = PIPE.width + PIPE.lipOverhang * 2
  const top = -WORLD.height
  const bottomStart = pipe.gapTop + PIPE.gap
  return (
    circleHitsRect(BIRD.x, birdY, BIRD.radius, left, top, width, pipe.gapTop - top) ||
    circleHitsRect(
      BIRD.x,
      birdY,
      BIRD.radius,
      left,
      bottomStart,
      width,
      WORLD.groundY - bottomStart,
    )
  )
}

export interface StepResult {
  world: World
  scored: boolean
  hit: boolean
}

export function step(world: World, dt: number, random: () => number = Math.random): StepResult {
  const moved = fall(world, dt)
  const shift = PIPE.speed * dt

  let pipes = moved.pipes
    .map((pipe) => ({ ...pipe, x: pipe.x - shift }))
    .filter((pipe) => pipe.x + PIPE.width + PIPE.lipOverhang > 0)

  const last = pipes[pipes.length - 1]
  if (!last) {
    pipes = [{ x: PIPE.firstX, gapTop: randomGapTop(random), scored: false }]
  } else if (last.x <= WORLD.width - PIPE.spacing + PIPE.width) {
    pipes = [...pipes, { x: last.x + PIPE.spacing, gapTop: randomGapTop(random), scored: false }]
  }

  let scored = false
  pipes = pipes.map((pipe) => {
    if (!pipe.scored && pipe.x + PIPE.width / 2 < BIRD.x) {
      scored = true
      return { ...pipe, scored: true }
    }
    return pipe
  })

  const next: World = {
    ...moved,
    pipes,
    score: moved.score + (scored ? 1 : 0),
    distance: moved.distance + shift,
  }
  const hit = hitsGround(next) || pipes.some((pipe) => hitsPipe(next.birdY, pipe))
  return { world: next, scored, hit }
}

export function birdAngle(velocity: number): number {
  if (velocity < 0) return -25
  return Math.min(90, -25 + (velocity / PHYSICS.maxFallSpeed) * 140)
}
