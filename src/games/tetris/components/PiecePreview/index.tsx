import { useEffect, useRef } from 'react'
import { drawPiecePreview, fitCanvas } from '../../render/draw'
import { readPalette } from '../../render/palette'
import type { PieceType } from '../../types'
import classes from './index.module.css'

const VIEW = { cols: 4.6, rows: 2.8 }

interface PiecePreviewProps {
  type: PieceType | null
  dimmed?: boolean
  small?: boolean
}

export function PiecePreview({ type, dimmed = false, small = false }: PiecePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => {
      const ctx = fitCanvas(canvas, VIEW.cols, VIEW.rows)
      if (!ctx) return
      ctx.clearRect(-VIEW.cols, -VIEW.rows, VIEW.cols * 3, VIEW.rows * 3)
      if (type) drawPiecePreview(ctx, readPalette(canvas), type, VIEW.cols, VIEW.rows)
    }
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      className={`${classes.canvas} ${small ? classes.small : ''} ${dimmed ? classes.dimmed : ''}`}
      aria-hidden="true"
    />
  )
}
