import { STORAGE_KEYS, loadNumber, saveNumber } from '@/shared/storage'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { MAX_FRAME_SECONDS, PIPE, RESTART_DELAY_MS } from '../config'
import { READY_Y, birdAngle, fall, flap, hitsGround, newWorld, step } from '../logic/world'
import { FULL_VIEW, drawScene, fitCanvas } from '../render/draw'
import { readPalette } from '../render/palette'
import type { Phase, World } from '../types'

export function useFlappyGame(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [phase, setPhase] = useState<Phase>('menu')
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadNumber(STORAGE_KEYS.BEST_FLAPPY))
  const [newBest, setNewBest] = useState(false)
  const [flashes, setFlashes] = useState(0)

  const worldRef = useRef<World>(newWorld())
  const phaseRef = useRef<Phase>('menu')
  const pausedRef = useRef(false)
  const bestRef = useRef(best)
  const overAtRef = useRef(0)

  const changePhase = (next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }

  const setPausedBoth = (value: boolean) => {
    pausedRef.current = value
    setPaused(value)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const palette = readPalette(canvas)
    let frame = 0
    let last = performance.now()

    const finish = (world: World) => {
      phaseRef.current = 'over'
      setPhase('over')
      overAtRef.current = performance.now()
      const isBest = world.score > bestRef.current
      setNewBest(isBest)
      if (isBest) {
        bestRef.current = world.score
        setBest(world.score)
        saveNumber(STORAGE_KEYS.BEST_FLAPPY, world.score)
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(MAX_FRAME_SECONDS, (now - last) / 1000)
      last = now
      const current = phaseRef.current
      let world = worldRef.current

      if (!pausedRef.current) {
        if (current === 'menu' || current === 'ready') {
          world = {
            ...world,
            birdY: READY_Y + Math.sin(now / 160) * 5,
            distance: world.distance + PIPE.speed * dt,
          }
        } else if (current === 'playing') {
          const result = step(world, dt)
          world = result.world
          if (result.scored) setScore(world.score)
          if (result.hit) {
            setFlashes((n) => n + 1)
            if (hitsGround(world)) {
              finish(world)
            } else {
              phaseRef.current = 'dying'
              setPhase('dying')
              world = { ...world, velocity: Math.max(world.velocity, 0) }
            }
          }
        } else if (current === 'dying') {
          world = fall(world, dt)
          if (hitsGround(world)) finish(world)
        }
        worldRef.current = world
      }

      const angle =
        current === 'menu' || current === 'ready'
          ? 0
          : current === 'over'
            ? 90
            : birdAngle(world.velocity)
      const flapping = current === 'playing' || current === 'menu' || current === 'ready'
      const wingFrame = flapping ? Math.floor(now / (current === 'playing' ? 80 : 130)) % 4 : 1

      const ctx = fitCanvas(canvas, FULL_VIEW)
      if (ctx) drawScene(ctx, palette, { world, angle, wingFrame })
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [canvasRef])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === 'playing') {
        pausedRef.current = true
        setPaused(true)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const getReady = () => {
    worldRef.current = { ...newWorld(), distance: worldRef.current.distance }
    setScore(0)
    setNewBest(false)
    setPausedBoth(false)
    changePhase('ready')
  }

  const action = () => {
    if (pausedRef.current) return
    const current = phaseRef.current
    if (current === 'menu') {
      getReady()
    } else if (current === 'ready') {
      worldRef.current = flap(worldRef.current)
      changePhase('playing')
    } else if (current === 'playing') {
      worldRef.current = flap(worldRef.current)
    } else if (current === 'over' && performance.now() - overAtRef.current > RESTART_DELAY_MS) {
      getReady()
    }
  }

  const togglePause = () => {
    if (phaseRef.current === 'playing') setPausedBoth(!pausedRef.current)
  }

  const toMenu = () => {
    worldRef.current = { ...newWorld(), distance: worldRef.current.distance }
    setScore(0)
    setPausedBoth(false)
    changePhase('menu')
  }

  return { phase, paused, score, best, newBest, flashes, action, getReady, togglePause, toMenu }
}
