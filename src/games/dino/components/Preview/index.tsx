import { useEffect, useRef } from 'react'
import { createObstacle } from '../../logic/world'
import { drawScene, fitCanvas, type View } from '../../render/draw'
import { readPalette } from '../../render/palette'
import '../../styles/colors.css'
import type { World } from '../../types'
import classes from './index.module.css'

const VIEW: View = { width: 300, height: 170, offsetY: 0 }

const WORLD_STILL: World = {
  dinoY: 46,
  velocity: 0,
  ducking: false,
  speed: 0,
  distance: 260,
  elapsed: 0,
  nextGap: 0,
  obstacles: [
    { ...createObstacle('cactus-large', 1, () => 0), x: 112 },
    { ...createObstacle('cactus-small', 2, () => 0), x: 196 },
    { ...createObstacle('bird', 1, () => 0.99), x: 250 },
  ],
  clouds: [
    { x: 30, y: 26 },
    { x: 200, y: 44 },
  ],
}

export default function PreviewDino() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => {
      const ctx = fitCanvas(canvas, VIEW)
      if (ctx)
        drawScene(ctx, readPalette(canvas), { world: WORLD_STILL, phase: 'running', time: 0 }, VIEW)
    }
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`theme-dino ${classes.canvas}`}
      style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}
      aria-hidden="true"
    />
  )
}
