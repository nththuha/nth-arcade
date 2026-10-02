import { useEffect, useRef } from 'react'
import { drawScene, fitCanvas, type View } from '../../render/draw'
import { readPalette } from '../../render/palette'
import '../../styles/colors.css'
import type { World } from '../../types'
import classes from './index.module.css'

const VIEW: View = { width: 400, top: 136, height: 280 }

const WORLD_STILL: World = {
  birdY: 262,
  velocity: 0,
  score: 0,
  distance: 34,
  pipes: [
    { x: 168, gapTop: 168, scored: false },
    { x: 336, gapTop: 222, scored: false },
  ],
}

export default function PreviewFlappy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => {
      const ctx = fitCanvas(canvas, VIEW)
      if (ctx)
        drawScene(ctx, readPalette(canvas), { world: WORLD_STILL, angle: -12, wingFrame: 0 }, VIEW)
    }
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`theme-flappy ${classes.canvas}`}
      style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}
      aria-hidden="true"
    />
  )
}
