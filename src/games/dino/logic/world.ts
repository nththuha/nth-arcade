import { CLOUDS, DINO, OBSTACLES, PHYSICS, SCORE_PER_PIXEL, SPEED, WORLD } from '../config'
import type { Box, Cloud, Obstacle, ObstacleKind, World } from '../types'

type Random = () => number

export function newWorld(): World {
  return {
    dinoY: 0,
    velocity: 0,
    ducking: false,
    speed: SPEED.start,
    distance: 0,
    elapsed: 0,
    obstacles: [],
    nextGap: 0,
    clouds: [
      { x: 120, y: 30 },
      { x: 380, y: 55 },
    ],
  }
}

export const scoreOf = (world: World) => Math.floor(world.distance * SCORE_PER_PIXEL)

export const onGround = (world: World) => world.dinoY <= 0

export function jump(world: World): World {
  if (!onGround(world) || world.ducking) return world
  return { ...world, velocity: PHYSICS.jumpVelocity }
}

export function releaseJump(world: World): World {
  if (world.velocity <= PHYSICS.dropVelocity) return world
  return { ...world, velocity: PHYSICS.dropVelocity }
}

export function setDucking(world: World, ducking: boolean): World {
  return world.ducking === ducking ? world : { ...world, ducking }
}

export function createObstacle(
  kind: ObstacleKind,
  count: number,
  random: Random,
  x: number = WORLD.width,
): Obstacle {
  if (kind === 'bird') {
    const { width, height } = OBSTACLES.bird
    const clearances = OBSTACLES.birdClearances
    const clearance = clearances[Math.floor(random() * clearances.length)]
    return { kind, x, y: WORLD.groundY - clearance - height, width, height, count: 1 }
  }
  const size = kind === 'cactus-small' ? OBSTACLES.cactusSmall : OBSTACLES.cactusLarge
  return {
    kind,
    x,
    y: WORLD.groundY - size.height,
    width: size.width * count,
    height: size.height,
    count,
  }
}

export function pickObstacle(speed: number, random: Random, x: number = WORLD.width): Obstacle {
  const kinds: ObstacleKind[] = ['cactus-small', 'cactus-large']
  if (speed >= SPEED.birdsFrom) kinds.push('bird')
  const kind = kinds[Math.floor(random() * kinds.length)]
  const maxCount = speed >= SPEED.multiCactusFrom ? 3 : 1
  const count = kind === 'bird' ? 1 : 1 + Math.floor(random() * maxCount)
  return createObstacle(kind, count, random, x)
}

export function gapAfter(obstacle: Obstacle, speed: number, random: Random): number {
  const minGap = obstacle.width * (speed / 60) + OBSTACLES.gapBase
  return Math.round(minGap * (1 + random() * OBSTACLES.gapRandom))
}

export function dinoBoxes(world: World): Box[] {
  const bottom = WORLD.groundY - world.dinoY
  if (world.ducking && onGround(world)) {
    return [
      {
        x: DINO.x + 2,
        y: bottom - DINO.duckHeight + 2,
        width: DINO.duckWidth - 6,
        height: DINO.duckHeight - 4,
      },
    ]
  }
  const top = bottom - DINO.height
  return [
    { x: DINO.x + 22, y: top + 2, width: 20, height: 14 },
    { x: DINO.x + 4, y: top + 16, width: 28, height: 24 },
  ]
}

export function obstacleBox(obstacle: Obstacle): Box {
  if (obstacle.kind === 'bird') {
    return {
      x: obstacle.x + 4,
      y: obstacle.y + 10,
      width: obstacle.width - 8,
      height: obstacle.height - 20,
    }
  }
  return {
    x: obstacle.x + 2,
    y: obstacle.y + 2,
    width: obstacle.width - 4,
    height: obstacle.height - 2,
  }
}

export const boxesOverlap = (a: Box, b: Box) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y

export function collides(world: World): boolean {
  const dino = dinoBoxes(world)
  return world.obstacles.some((obstacle) => {
    const box = obstacleBox(obstacle)
    return dino.some((part) => boxesOverlap(part, box))
  })
}

function moveClouds(clouds: Cloud[], shift: number, random: Random, edge: number): Cloud[] {
  const moved = clouds.map((c) => ({ ...c, x: c.x - shift })).filter((c) => c.x + CLOUDS.width > 0)
  const last = moved[moved.length - 1]
  if (!last || last.x < edge - 120 - random() * 260) {
    moved.push({ x: edge, y: CLOUDS.minY + random() * (CLOUDS.maxY - CLOUDS.minY) })
  }
  return moved
}

export interface StepResult {
  world: World
  crashed: boolean
}

export function step(
  world: World,
  dt: number,
  random: Random = Math.random,
  viewWidth: number = WORLD.width,
): StepResult {
  const edge = Math.max(WORLD.width, viewWidth)
  const gravity =
    PHYSICS.gravity * (world.ducking && !onGround(world) ? PHYSICS.fastFallMultiplier : 1)
  let velocity = world.velocity - gravity * dt
  let dinoY = world.dinoY + velocity * dt
  if (dinoY <= 0) {
    dinoY = 0
    velocity = 0
  }

  const speed = Math.min(SPEED.max, world.speed + SPEED.acceleration * dt)
  const shift = speed * dt
  const elapsed = world.elapsed + dt

  let obstacles = world.obstacles
    .map((o) => ({ ...o, x: o.x - shift }))
    .filter((o) => o.x + o.width > 0)
  let nextGap = world.nextGap

  if (elapsed >= OBSTACLES.firstAfterSeconds) {
    const last = obstacles[obstacles.length - 1]
    if (!last || last.x + last.width + nextGap < edge) {
      const obstacle = pickObstacle(speed, random, edge)
      obstacles = [...obstacles, obstacle]
      nextGap = gapAfter(obstacle, speed, random)
    }
  }

  const next: World = {
    ...world,
    dinoY,
    velocity,
    speed,
    distance: world.distance + shift,
    elapsed,
    obstacles,
    nextGap,
    clouds: moveClouds(world.clouds, shift * CLOUDS.speedRatio, random, edge),
  }
  return { world: next, crashed: collides(next) }
}
