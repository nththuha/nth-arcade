import { describe, expect, it } from 'vitest'
import { BIRD, PHYSICS, PIPE, WORLD, medalFor } from '../config'
import type { World } from '../types'
import { birdAngle, fall, flap, hitsGround, hitsPipe, newWorld, randomGapTop, step } from './world'

const still = () => 0.5

describe('flap and fall', () => {
  it('flap sets an upward velocity', () => {
    expect(flap(newWorld()).velocity).toBe(PHYSICS.flapVelocity)
  })

  it('gravity pulls the bird down, capped at the max fall speed', () => {
    let world = newWorld()
    for (let i = 0; i < 200; i++) world = fall(world, 1 / 60)
    expect(world.velocity).toBe(PHYSICS.maxFallSpeed)
    expect(hitsGround(world)).toBe(true)
  })

  it('never leaves the top of the screen', () => {
    let world = newWorld()
    for (let i = 0; i < 120; i++) world = fall(flap(world), 1 / 60)
    expect(world.birdY).toBe(BIRD.radius)
  })

  it('a flap makes the bird rise', () => {
    const world = fall(flap(newWorld()), 1 / 60)
    expect(world.birdY).toBeLessThan(newWorld().birdY)
  })
})

describe('pipes', () => {
  it('keeps the gap fully above the ground', () => {
    for (const r of [0, 0.5, 0.999]) {
      const top = randomGapTop(() => r)
      expect(top).toBeGreaterThanOrEqual(PIPE.minTop)
      expect(top + PIPE.gap).toBeLessThanOrEqual(WORLD.groundY - PIPE.minTop)
    }
  })

  it('spawns the first pipe off screen and keeps spacing', () => {
    let world: World = newWorld()
    world = step(world, 1 / 60, still).world
    expect(world.pipes).toHaveLength(1)
    expect(world.pipes[0].x).toBeGreaterThan(WORLD.width)

    for (let i = 0; i < 200; i++)
      world = { ...step(world, 1 / 60, still).world, birdY: 0, velocity: 0 }
    const xs = world.pipes.map((p) => p.x)
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeCloseTo(PIPE.spacing)
  })

  it('detects hitting a pipe but not flying through the gap', () => {
    const pipe = { x: BIRD.x - PIPE.width / 2, gapTop: 150, scored: false }
    expect(hitsPipe(150 + PIPE.gap / 2, pipe)).toBe(false)
    expect(hitsPipe(150, pipe)).toBe(true)
    expect(hitsPipe(150 + PIPE.gap, pipe)).toBe(true)
    expect(hitsPipe(-100, pipe)).toBe(true)
  })
})

describe('step', () => {
  it('scores once when a pipe passes the bird', () => {
    const gapTop = 150
    let world: World = {
      ...newWorld(),
      birdY: gapTop + PIPE.gap / 2,
      pipes: [{ x: BIRD.x - PIPE.width / 2 + 1, gapTop, scored: false }],
    }
    let points = 0
    for (let i = 0; i < 30; i++) {
      const result = step({ ...world, velocity: 0, birdY: gapTop + PIPE.gap / 2 }, 1 / 60, still)
      world = result.world
      if (result.scored) points++
      expect(result.hit).toBe(false)
    }
    expect(points).toBe(1)
    expect(world.score).toBe(1)
  })

  it('reports a hit when the bird reaches the ground', () => {
    const world = { ...newWorld(), birdY: WORLD.groundY - BIRD.radius - 1, velocity: 300 }
    expect(step(world, 1 / 60, still).hit).toBe(true)
  })
})

describe('birdAngle', () => {
  it('tilts up when rising and nose-dives when falling fast', () => {
    expect(birdAngle(-100)).toBe(-25)
    expect(birdAngle(PHYSICS.maxFallSpeed)).toBe(90)
  })
})

describe('medalFor', () => {
  it('awards medals by score', () => {
    expect(medalFor(9)).toBeNull()
    expect(medalFor(10)).toBe('bronze')
    expect(medalFor(25)).toBe('silver')
    expect(medalFor(30)).toBe('gold')
    expect(medalFor(99)).toBe('platinum')
  })
})
