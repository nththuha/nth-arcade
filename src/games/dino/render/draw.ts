import { CLOUDS, DINO, OBSTACLES, WORLD } from '../config'
import { onGround } from '../logic/world'
import type { Obstacle, Phase, World } from '../types'
import type { Palette } from './palette'
import { DINO_SPRITES, type DinoSprite } from './sprites'

export interface View {
  width: number
  height: number
  offsetY: number
}

const VIEW_LIMITS = { minWidth: 480, maxWidth: 1000, groundAt: 0.62, stripShare: 0.45 }

const GROUND_PATTERN = 1200

function drawRows(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  rows: string[],
  x: number,
  y: number,
) {
  const p = DINO.pixel
  const overlap = 0.5
  ctx.fillStyle = palette.ink
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '#') ctx.fillRect(x + c * p, y + r * p, p + overlap, p + overlap)
    }
  })
  ctx.fillStyle = palette.eye
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === 'e') ctx.fillRect(x + c * p, y + r * p, p, p)
    }
  })
}

function dinoSprite(world: World, phase: Phase, time: number): DinoSprite {
  if (phase === 'over') return 'dead'
  if (phase === 'waiting') return 'stand'
  const step = Math.floor(time / 100) % 2 === 0
  if (world.ducking && onGround(world)) return step ? 'duckA' : 'duckB'
  if (!onGround(world)) return 'stand'
  return step ? 'runA' : 'runB'
}

function drawDino(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  world: World,
  phase: Phase,
  time: number,
) {
  const sprite = dinoSprite(world, phase, time)
  const rows = DINO_SPRITES[sprite]
  const height = rows.length * DINO.pixel
  drawRows(ctx, palette, rows, DINO.x, Math.round(WORLD.groundY - height + 4 - world.dinoY))
}

function drawCactus(ctx: CanvasRenderingContext2D, x: number, y: number, large: boolean) {
  const size = large ? OBSTACLES.cactusLarge : OBSTACLES.cactusSmall
  const h = size.height
  const trunkW = large ? 7 : 5
  const trunkX = x + Math.floor((size.width - trunkW) / 2)
  const armW = large ? 4 : 3
  ctx.fillRect(trunkX + 1, y, trunkW - 2, 2)
  ctx.fillRect(trunkX, y + 1, trunkW, h - 1)
  const leftX = x + (large ? 1 : 0)
  const leftTop = y + Math.round(h * 0.28)
  const leftBottom = y + Math.round(h * 0.58)
  ctx.fillRect(leftX, leftTop, armW, leftBottom - leftTop)
  ctx.fillRect(leftX, leftBottom - armW, trunkX - leftX, armW)
  const rightX = x + size.width - armW - (large ? 1 : 0)
  const rightTop = y + Math.round(h * 0.16)
  const rightBottom = y + Math.round(h * 0.46)
  ctx.fillRect(rightX, rightTop, armW, rightBottom - rightTop)
  ctx.fillRect(trunkX + trunkW, rightBottom - armW, rightX - trunkX - trunkW, armW)
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  x: number,
  y: number,
  wingUp: boolean,
) {
  ctx.fillStyle = palette.ink
  ctx.fillRect(x, y + 18, 8, 3)
  ctx.fillRect(x + 6, y + 13, 10, 9)
  ctx.fillRect(x + 12, y + 18, 26, 8)
  ctx.fillRect(x + 36, y + 20, 8, 3)
  ctx.fillRect(x + 38, y + 17, 4, 3)
  for (let r = 0; r < 8; r++) {
    if (wingUp) ctx.fillRect(x + 18, y + 2 + r * 2, 2 + r * 2, 2)
    else ctx.fillRect(x + 18, y + 26 + r * 2, 16 - r * 2, 2)
  }
  ctx.fillStyle = palette.eye
  ctx.fillRect(x + 10, y + 15, 2, 2)
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  obstacle: Obstacle,
  time: number,
) {
  const x = Math.round(obstacle.x)
  if (obstacle.kind === 'bird') {
    drawBird(ctx, palette, x, Math.round(obstacle.y), Math.floor(time / 180) % 2 === 0)
    return
  }
  ctx.fillStyle = palette.ink
  const large = obstacle.kind === 'cactus-large'
  const single = large ? OBSTACLES.cactusLarge.width : OBSTACLES.cactusSmall.width
  for (let i = 0; i < obstacle.count; i++) drawCactus(ctx, x + i * single, obstacle.y, large)
}

function drawCloud(ctx: CanvasRenderingContext2D, palette: Palette, x: number, y: number) {
  const w = CLOUDS.width
  const h = CLOUDS.height
  ctx.strokeStyle = palette.cloud
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x + 6, y + h - 3)
  ctx.lineTo(x + 12, y + h - 3)
  ctx.lineTo(x + 16, y + 3)
  ctx.lineTo(x + 26, y)
  ctx.lineTo(x + 32, y + 4)
  ctx.lineTo(x + 36, y + h - 6)
  ctx.lineTo(x + 42, y + h - 4)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fillStyle = palette.bg
  ctx.fill()
  ctx.stroke()
}

function pseudoRandom(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

function drawGround(ctx: CanvasRenderingContext2D, palette: Palette, distance: number, view: View) {
  const y = WORLD.groundY
  const offset = distance % GROUND_PATTERN
  ctx.fillStyle = palette.ink
  for (let sx = 0; sx < view.width; sx++) {
    const gx = (sx + offset) % GROUND_PATTERN
    const bumpAt = gx % 300
    const bump = bumpAt < 14 && pseudoRandom(Math.floor((sx + offset) / 300)) > 0.5
    const lift = bump ? Math.round(Math.sin((bumpAt / 14) * Math.PI) * 3) : 0
    ctx.fillRect(sx, y - lift, 1.5, 1)
  }
  for (let i = 0; i < 70; i++) {
    const gx = pseudoRandom(i) * GROUND_PATTERN
    const sx = (((gx - offset) % GROUND_PATTERN) + GROUND_PATTERN) % GROUND_PATTERN
    if (sx > view.width) continue
    const dy = 3 + Math.floor(pseudoRandom(i + 99) * 8)
    const w = 1 + Math.floor(pseudoRandom(i + 7) * 3)
    ctx.fillRect(Math.round(sx), y + dy, w, 1)
  }
}

export interface Scene {
  world: World
  phase: Phase
  time: number
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  scene: Scene,
  view: View,
) {
  const { world, phase, time } = scene
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, view.width, view.height)
  ctx.save()
  ctx.translate(0, view.offsetY)
  for (const cloud of world.clouds)
    drawCloud(ctx, palette, Math.round(cloud.x), Math.round(cloud.y))
  drawGround(ctx, palette, world.distance, view)
  for (const obstacle of world.obstacles) drawObstacle(ctx, palette, obstacle, time)
  drawDino(ctx, palette, world, phase, time)
  ctx.restore()
}

export function fitCanvas(canvas: HTMLCanvasElement, view: View): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const ratio = window.devicePixelRatio || 1
  const width = Math.max(1, Math.round(canvas.clientWidth * ratio))
  const height = Math.round((width * view.height) / view.width)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  const scale = width / view.width
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.imageSmoothingEnabled = false
  return ctx
}

export function fitScreen(
  canvas: HTMLCanvasElement,
): { ctx: CanvasRenderingContext2D; view: View } | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const cssWidth = Math.max(1, canvas.clientWidth)
  const cssHeight = Math.max(1, canvas.clientHeight)
  const ratio = window.devicePixelRatio || 1
  const width = Math.round(cssWidth * ratio)
  const height = Math.round(cssHeight * ratio)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  const scale = Math.max(
    cssWidth / VIEW_LIMITS.maxWidth,
    Math.min((cssHeight * VIEW_LIMITS.stripShare) / WORLD.height, cssWidth / VIEW_LIMITS.minWidth),
  )
  ctx.setTransform(scale * ratio, 0, 0, scale * ratio, 0, 0)
  ctx.imageSmoothingEnabled = false
  const view: View = {
    width: cssWidth / scale,
    height: cssHeight / scale,
    offsetY: (cssHeight * VIEW_LIMITS.groundAt) / scale - WORLD.groundY,
  }
  return { ctx, view }
}
