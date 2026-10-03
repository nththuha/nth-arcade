import { BOARD } from '../config'
import { cellsOf } from '../logic/pieces'
import type { Board, Piece, PieceType } from '../types'
import type { Palette } from './palette'

export interface Flash {
  rows: number[]
  progress: number
}

export interface Scene {
  board: Board
  piece: Piece | null
  ghostY: number | null
  flash: Flash | null
}

const colorOf = (palette: Palette, type: PieceType) =>
  palette[`piece-${type.toLowerCase()}` as keyof Palette]

export function fitCanvas(canvas: HTMLCanvasElement, cols: number, rows: number) {
  const ctx = canvas.getContext('2d')
  const { clientWidth, clientHeight } = canvas
  if (!ctx || clientWidth === 0 || clientHeight === 0) return null
  const dpr = window.devicePixelRatio || 1
  const width = Math.round(clientWidth * dpr)
  const height = Math.round(clientHeight * dpr)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  const scale = Math.min(width / cols, height / rows)
  ctx.setTransform(scale, 0, 0, scale, (width - cols * scale) / 2, (height - rows * scale) / 2)
  return ctx
}

export function drawBlock(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  type: PieceType,
  x: number,
  y: number,
) {
  const inset = 0.04
  const size = 1 - inset * 2
  const bevel = 0.14
  ctx.fillStyle = colorOf(palette, type)
  ctx.fillRect(x + inset, y + inset, size, size)
  ctx.fillStyle = palette['block-highlight']
  ctx.fillRect(x + inset, y + inset, size, bevel)
  ctx.fillRect(x + inset, y + inset + bevel, bevel, size - bevel)
  ctx.fillStyle = palette['block-shade']
  ctx.fillRect(x + inset + bevel, y + inset + size - bevel, size - bevel, bevel)
  ctx.fillRect(x + inset + size - bevel, y + inset + bevel, bevel, size - bevel * 2)
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  type: PieceType,
  x: number,
  y: number,
) {
  ctx.globalAlpha = 0.16
  ctx.fillStyle = colorOf(palette, type)
  ctx.fillRect(x + 0.04, y + 0.04, 0.92, 0.92)
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = colorOf(palette, type)
  ctx.lineWidth = 0.07
  ctx.strokeRect(x + 0.1, y + 0.1, 0.8, 0.8)
  ctx.globalAlpha = 1
}

export function drawBoard(ctx: CanvasRenderingContext2D, palette: Palette, scene: Scene) {
  const { cols, rows, hidden } = BOARD
  ctx.fillStyle = palette.board
  ctx.fillRect(0, 0, cols, rows)

  ctx.strokeStyle = palette.grid
  ctx.lineWidth = 0.04
  ctx.beginPath()
  for (let x = 1; x < cols; x++) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, rows)
  }
  for (let y = 1; y < rows; y++) {
    ctx.moveTo(0, y)
    ctx.lineTo(cols, y)
  }
  ctx.stroke()

  scene.board.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell && y >= hidden) drawBlock(ctx, palette, cell, x, y - hidden)
    }),
  )

  const { piece, ghostY } = scene
  if (piece) {
    const cells = cellsOf(piece.type, piece.rotation)
    if (ghostY !== null && ghostY !== piece.y) {
      cells.forEach(([cx, cy]) => {
        const y = ghostY + cy - hidden
        if (y >= 0) drawGhost(ctx, palette, piece.type, piece.x + cx, y)
      })
    }
    cells.forEach(([cx, cy]) => {
      const y = piece.y + cy - hidden
      if (y >= 0) drawBlock(ctx, palette, piece.type, piece.x + cx, y)
    })
  }

  const { flash } = scene
  if (flash) {
    const grow = flash.progress * 0.5
    ctx.globalAlpha = 0.85 * (1 - flash.progress)
    ctx.fillStyle = palette.flash
    flash.rows.forEach((row) => ctx.fillRect(0, row - hidden - grow / 2, cols, 1 + grow))
    ctx.globalAlpha = 1
  }
}

export function drawPiecePreview(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  type: PieceType,
  cols: number,
  rows: number,
) {
  const cells = cellsOf(type, 0)
  const xs = cells.map(([x]) => x)
  const ys = cells.map(([, y]) => y)
  const width = Math.max(...xs) - Math.min(...xs) + 1
  const height = Math.max(...ys) - Math.min(...ys) + 1
  const offsetX = (cols - width) / 2 - Math.min(...xs)
  const offsetY = (rows - height) / 2 - Math.min(...ys)
  cells.forEach(([x, y]) => drawBlock(ctx, palette, type, x + offsetX, y + offsetY))
}
