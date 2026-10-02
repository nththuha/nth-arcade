import { BIRD, PIPE, WORLD } from '../config'
import type { World } from '../types'
import type { Palette, PaletteKey } from './palette'

export interface View {
  width: number
  top: number
  height: number
}

export interface Scene {
  world: World
  angle: number
  wingFrame: number
}

export const FULL_VIEW: View = { width: WORLD.width, top: 0, height: WORLD.height }

const BODY = [
  '......oooooo.....',
  '....ooLLLLowwo...',
  '...oLyyyyowwwwo..',
  '..oyyyyyyowwwbo..',
  '.oyyyyyyyowwwbo..',
  '.oyyyyyyyyowwwo..',
  '.oyyyyyyyyyooooo.',
  '.oyyyyyyyyorrrrro',
  '..oyyyyyyoRooooo.',
  '..obbbbbbbRRRRRo.',
  '...ooobbbbooooo..',
  '......oooooo.....',
]

const WING = ['.oooo.', 'oWWWWo', 'oWWWWo', '.oooo.']
const WING_OFFSETS = [3, 4, 5, 4]

const SPRITE_COLORS: Record<string, PaletteKey> = {
  o: 'bird-outline',
  y: 'bird-body',
  L: 'bird-body-light',
  b: 'bird-belly',
  w: 'bird-eye',
  r: 'bird-beak',
  R: 'bird-beak-dark',
  W: 'bird-wing',
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  rows: string[],
  x: number,
  y: number,
  pixel: number,
) {
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const key = SPRITE_COLORS[row[c]]
      if (!key) continue
      ctx.fillStyle = palette[key]
      ctx.fillRect(x + c * pixel, y + r * pixel, pixel, pixel)
    }
  })
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  y: number,
  angle: number,
  frame: number,
) {
  const pixel = BIRD.pixel
  const w = BODY[0].length * pixel
  const h = BODY.length * pixel
  ctx.save()
  ctx.translate(BIRD.x, y)
  ctx.rotate((angle * Math.PI) / 180)
  drawSprite(ctx, palette, BODY, -w / 2, -h / 2, pixel)
  drawSprite(
    ctx,
    palette,
    WING,
    -w / 2,
    -h / 2 + WING_OFFSETS[frame % WING_OFFSETS.length] * pixel,
    pixel,
  )
  ctx.restore()
}

function repeat(
  offset: number,
  period: number,
  from: number,
  to: number,
  draw: (x: number) => void,
) {
  const start = from - (((offset % period) + period) % period)
  for (let x = start; x < to + period; x += period) draw(x)
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, Math.PI, 0)
  ctx.fill()
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  distance: number,
  view: View,
) {
  const ground = WORLD.groundY
  ctx.fillStyle = palette.sky
  ctx.fillRect(0, view.top, view.width, view.height)

  const cloudTop = ground - 92
  repeat(distance * 0.1, 64, 0, view.width, (x) => {
    ctx.fillStyle = palette['cloud-shade']
    blob(ctx, x + 14, cloudTop + 18, 20)
    blob(ctx, x + 46, cloudTop + 12, 24)
    ctx.fillStyle = palette.cloud
    blob(ctx, x + 14, cloudTop + 22, 18)
    blob(ctx, x + 46, cloudTop + 16, 22)
  })
  ctx.fillStyle = palette.cloud
  ctx.fillRect(0, cloudTop + 16, view.width, ground - cloudTop)

  const buildings = [
    [0, 26, 18],
    [20, 40, 14],
    [36, 20, 20],
    [58, 34, 16],
    [76, 24, 22],
    [100, 44, 14],
  ]
  repeat(distance * 0.25, 120, 0, view.width, (x) => {
    for (const [bx, bh, bw] of buildings) {
      const top = ground - 30 - bh
      ctx.fillStyle = palette['city-shade']
      ctx.fillRect(x + bx, top, bw, bh + 30)
      ctx.fillStyle = palette.city
      ctx.fillRect(x + bx + 1, top + 1, bw - 2, bh + 29)
      ctx.fillStyle = palette['city-window']
      for (let wy = top + 4; wy < ground - 34; wy += 6) {
        for (let wx = x + bx + 3; wx < x + bx + bw - 3; wx += 5) ctx.fillRect(wx, wy, 2, 3)
      }
    }
  })

  repeat(distance * 0.5, 30, 0, view.width, (x) => {
    ctx.fillStyle = palette['bush-shade']
    blob(ctx, x + 15, ground - 12, 16)
    ctx.fillStyle = palette.bush
    blob(ctx, x + 15, ground - 10, 14)
  })
  ctx.fillStyle = palette.bush
  ctx.fillRect(0, ground - 12, view.width, 12)
}

function drawPipePart(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (height <= 0) return
  ctx.fillStyle = palette['pipe-outline']
  ctx.fillRect(x, y, width, height)
  ctx.fillStyle = palette.pipe
  ctx.fillRect(x + 2, y + 2, width - 4, height - 4)
  ctx.fillStyle = palette['pipe-light']
  ctx.fillRect(x + 4, y + 2, Math.round(width * 0.2), height - 4)
  ctx.fillStyle = palette['pipe-highlight']
  ctx.fillRect(x + 6, y + 2, 3, height - 4)
  ctx.fillStyle = palette['pipe-dark']
  ctx.fillRect(
    x + width - Math.round(width * 0.22),
    y + 2,
    Math.round(width * 0.22) - 2,
    height - 4,
  )
}

function drawPipes(ctx: CanvasRenderingContext2D, palette: Palette, world: World, view: View) {
  const lipWidth = PIPE.width + PIPE.lipOverhang * 2
  for (const pipe of world.pipes) {
    const x = Math.round(pipe.x)
    const lipX = x - PIPE.lipOverhang
    const top = view.top - 4
    const bottomStart = pipe.gapTop + PIPE.gap
    drawPipePart(ctx, palette, x, top, PIPE.width, pipe.gapTop - PIPE.lipHeight - top + 2)
    drawPipePart(ctx, palette, lipX, pipe.gapTop - PIPE.lipHeight, lipWidth, PIPE.lipHeight)
    drawPipePart(ctx, palette, lipX, bottomStart, lipWidth, PIPE.lipHeight)
    drawPipePart(
      ctx,
      palette,
      x,
      bottomStart + PIPE.lipHeight - 2,
      PIPE.width,
      WORLD.groundY - bottomStart - PIPE.lipHeight + 2,
    )
  }
}

function drawGround(ctx: CanvasRenderingContext2D, palette: Palette, distance: number, view: View) {
  const y = WORLD.groundY
  ctx.fillStyle = palette.ground
  ctx.fillRect(0, y, view.width, WORLD.height - y)
  ctx.fillStyle = palette['ground-edge']
  ctx.fillRect(0, y, view.width, 2)
  ctx.fillStyle = palette['ground-stripe-dark']
  ctx.fillRect(0, y + 2, view.width, 10)
  ctx.fillStyle = palette['ground-stripe-light']
  repeat(distance, 12, 0, view.width, (x) => {
    ctx.beginPath()
    ctx.moveTo(x, y + 2)
    ctx.lineTo(x + 6, y + 2)
    ctx.lineTo(x + 1, y + 12)
    ctx.lineTo(x - 5, y + 12)
    ctx.closePath()
    ctx.fill()
  })
  ctx.fillStyle = palette['ground-line']
  ctx.fillRect(0, y + 12, view.width, 2)
  ctx.fillStyle = palette['ground-shade']
  ctx.fillRect(0, y + 14, view.width, 4)
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  scene: Scene,
  view: View = FULL_VIEW,
) {
  const { world } = scene
  ctx.save()
  ctx.translate(0, -view.top)
  drawBackground(ctx, palette, world.distance, view)
  drawPipes(ctx, palette, world, view)
  drawGround(ctx, palette, world.distance, view)
  drawBird(ctx, palette, world.birdY, scene.angle, scene.wingFrame)
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
