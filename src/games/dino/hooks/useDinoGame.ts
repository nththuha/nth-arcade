import { STORAGE_KEYS, loadNumber, saveNumber } from '@/shared/storage'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { MAX_FRAME_SECONDS, RESTART_DELAY_MS, WORLD } from '../config'
import { jump, newWorld, releaseJump, scoreOf, setDucking, step } from '../logic/world'
import { drawScene, fitScreen } from '../render/draw'
import { readPalette } from '../render/palette'
import type { Phase, World } from '../types'

export function useDinoGame(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => loadNumber(STORAGE_KEYS.BEST_DINO))

  const worldRef = useRef<World>(newWorld())
  const phaseRef = useRef<Phase>('waiting')
  const duckRef = useRef(false)
  const highRef = useRef(highScore)
  const overAtRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const palette = readPalette(canvas)
    let frame = 0
    let last = performance.now()
    let shownScore = 0
    let viewWidth: number = WORLD.width

    const tick = (now: number) => {
      const dt = Math.min(MAX_FRAME_SECONDS, (now - last) / 1000)
      last = now
      let world = worldRef.current

      if (phaseRef.current === 'running') {
        const result = step(setDucking(world, duckRef.current), dt, Math.random, viewWidth)
        world = result.world
        const current = scoreOf(world)
        if (current !== shownScore) {
          shownScore = current
          setScore(current)
        }
        if (result.crashed) {
          phaseRef.current = 'over'
          setPhase('over')
          overAtRef.current = now
          navigator.vibrate?.(120)
          if (current > highRef.current) {
            highRef.current = current
            setHighScore(current)
            saveNumber(STORAGE_KEYS.BEST_DINO, current)
          }
        }
        worldRef.current = world
      } else if (phaseRef.current === 'waiting') {
        shownScore = 0
      }

      const fitted = fitScreen(canvas)
      if (fitted) {
        viewWidth = fitted.view.width
        drawScene(fitted.ctx, palette, { world, phase: phaseRef.current, time: now }, fitted.view)
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [canvasRef])

  const start = () => {
    worldRef.current = jump(newWorld())
    setScore(0)
    phaseRef.current = 'running'
    setPhase('running')
  }

  const pressJump = () => {
    const current = phaseRef.current
    if (current === 'waiting') start()
    else if (current === 'running') worldRef.current = jump(worldRef.current)
    else if (performance.now() - overAtRef.current > RESTART_DELAY_MS) start()
  }

  const release = () => {
    if (phaseRef.current === 'running') worldRef.current = releaseJump(worldRef.current)
  }

  const duck = (on: boolean) => {
    duckRef.current = on
  }

  const restart = () => {
    if (phaseRef.current === 'over') start()
  }

  return { phase, score, highScore, pressJump, release, duck, restart }
}
