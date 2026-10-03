import { describe, expect, it } from 'vitest'
import { DINO, OBSTACLES, PHYSICS, SPEED, WORLD } from '../config'
import type { World } from '../types'
import {
  collides,
  createObstacle,
  jump,
  newWorld,
  onGround,
  pickObstacle,
  releaseJump,
  scoreOf,
  setDucking,
  step,
} from './world'

const fixed = (value: number) => () => value
const run = (world: World, seconds: number, random = fixed(0.5)) => {
  let w = world
  for (let t = 0; t < seconds; t += 1 / 60) w = step(w, 1 / 60, random).world
  return w
}

describe('jumping', () => {
  it('jumps only from the ground', () => {
    const jumping = jump(newWorld())
    expect(jumping.velocity).toBe(PHYSICS.jumpVelocity)
    const inAir = step(jumping, 1 / 60).world
    expect(jump(inAir)).toBe(inAir)
  })

  it('reaches a peak and lands again', () => {
    let world = jump(newWorld())
    let peak = 0
    for (let i = 0; i < 120; i++) {
      world = { ...step(world, 1 / 60).world, obstacles: [] }
      peak = Math.max(peak, world.dinoY)
    }
    expect(peak).toBeGreaterThan(OBSTACLES.cactusLarge.height)
    expect(onGround(world)).toBe(true)
  })

  it('releasing early gives a lower jump', () => {
    const peakOf = (release: boolean) => {
      let world = jump(newWorld())
      let peak = 0
      for (let i = 0; i < 90; i++) {
        if (release && i === 3) world = releaseJump(world)
        world = { ...step(world, 1 / 60).world, obstacles: [] }
        peak = Math.max(peak, world.dinoY)
      }
      return peak
    }
    expect(peakOf(true)).toBeLessThan(peakOf(false))
  })

  it('cannot jump while ducking, and ducking falls faster', () => {
    expect(jump(setDucking(newWorld(), true)).velocity).toBe(0)
    const air = step(jump(newWorld()), 1 / 60).world
    const normal = step(air, 1 / 60).world
    const fast = step(setDucking(air, true), 1 / 60).world
    expect(fast.velocity).toBeLessThan(normal.velocity)
  })
})

describe('running', () => {
  it('speeds up over time but never above the max', () => {
    const world = run(newWorld(), 2)
    expect(world.speed).toBeGreaterThan(SPEED.start)
    expect({ ...world, speed: SPEED.max }.speed).toBeLessThanOrEqual(SPEED.max)
    let fast = { ...newWorld(), speed: SPEED.max }
    fast = step(fast, 1).world
    expect(fast.speed).toBe(SPEED.max)
  })

  it('scores by distance', () => {
    expect(scoreOf({ ...newWorld(), distance: 4000 })).toBe(100)
  })

  it('waits before the first obstacle, then spawns them off screen', () => {
    expect(run(newWorld(), OBSTACLES.firstAfterSeconds - 0.1).obstacles).toHaveLength(0)
    const world = step(
      { ...newWorld(), elapsed: OBSTACLES.firstAfterSeconds },
      1 / 60,
      fixed(0),
    ).world
    expect(world.obstacles).toHaveLength(1)
    expect(world.obstacles[0].x).toBeGreaterThan(WORLD.width - 10)
  })
})

describe('obstacles', () => {
  it('only sends birds and cactus groups at higher speeds', () => {
    for (let r = 0; r < 1; r += 0.05) {
      const slow = pickObstacle(SPEED.start, fixed(r))
      expect(slow.kind).not.toBe('bird')
      expect(slow.count).toBe(1)
    }
    expect(pickObstacle(SPEED.max, fixed(0.99)).kind).toBe('bird')
    expect(pickObstacle(SPEED.max, fixed(0.6)).count).toBe(2)
  })

  it('sits cacti on the ground', () => {
    const cactus = createObstacle('cactus-large', 3, fixed(0))
    expect(cactus.y + cactus.height).toBe(WORLD.groundY)
    expect(cactus.width).toBe(OBSTACLES.cactusLarge.width * 3)
  })
})

describe('collisions', () => {
  const cactusAtDino = { ...createObstacle('cactus-large', 1, fixed(0)), x: DINO.x + 10 }

  it('crashes into a cactus on the ground', () => {
    expect(collides({ ...newWorld(), obstacles: [cactusAtDino] })).toBe(true)
  })

  it('clears a cactus when high enough', () => {
    expect(collides({ ...newWorld(), dinoY: 70, obstacles: [cactusAtDino] })).toBe(false)
  })

  it('ducks under a mid-height bird but not a low one', () => {
    const bird = (index: number) => ({
      ...createObstacle('bird', 1, fixed((index + 0.5) / OBSTACLES.birdClearances.length)),
      x: DINO.x + 10,
    })
    const ducking = setDucking(newWorld(), true)
    expect(collides({ ...newWorld(), obstacles: [bird(1)] })).toBe(true)
    expect(collides({ ...ducking, obstacles: [bird(1)] })).toBe(false)
    expect(collides({ ...ducking, obstacles: [bird(0)] })).toBe(true)
    expect(collides({ ...newWorld(), obstacles: [bird(2)] })).toBe(false)
  })
})
