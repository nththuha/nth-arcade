import { useEffect, useRef } from 'react'
import { BOARD } from '../../config'
import { drawBoard, fitCanvas } from '../../render/draw'
import { readPalette } from '../../render/palette'
import '../../styles/colors.css'
import type { Board, Cell } from '../../types'
import classes from './index.module.css'

const STACK = [
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '.......O..',
  'L.....OO..',
  'L....SSZZ.',
  'LL..SSJZZ.',
  'ZZTTOOJJJ.',
  'IZZTOOLSS.',
  'IJJJLLLTS.',
]

const BOARD_ROWS: Board = [
  ...Array.from({ length: BOARD.hidden }, () => Array<Cell>(BOARD.cols).fill(null)),
  ...STACK.map((row) => row.split('').map((ch) => (ch === '.' ? null : (ch as Cell)))),
]

export default function PreviewTetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = fitCanvas(canvas, BOARD.cols, BOARD.rows)
    if (!ctx) return
    drawBoard(ctx, readPalette(canvas), {
      board: BOARD_ROWS,
      piece: { type: 'I', rotation: 1, x: 7, y: 9 },
      ghostY: 18,
      flash: null,
    })
  }, [])

  return (
    <div className={`theme-tetris ${classes.frame}`} aria-hidden="true">
      <canvas ref={canvasRef} className={classes.canvas} />
    </div>
  )
}
