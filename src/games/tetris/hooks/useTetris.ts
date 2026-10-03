import { STORAGE_KEYS, loadNumber, saveNumber } from '@/shared/storage'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import {
  BOARD,
  FLASH_SECONDS,
  INPUT,
  MAX_FRAME_SECONDS,
  QUEUE_SIZE,
  RESTART_DELAY_MS,
} from '../config'
import { ghostY, hardDrop, holdPiece, move, newGame, rotate, tick } from '../logic/game'
import { drawBoard, fitCanvas, type Flash } from '../render/draw'
import { readPalette } from '../render/palette'
import type { ClearEvent, Game, Phase, PieceType } from '../types'

export interface HudState {
  score: number
  lines: number
  level: number
  hold: PieceType | null
  canHold: boolean
  queue: PieceType[]
  lastClear: ClearEvent | null
}

const hudOf = (game: Game): HudState => ({
  score: game.score,
  lines: game.lines,
  level: game.level,
  hold: game.hold,
  canHold: game.canHold,
  queue: game.queue.slice(0, QUEUE_SIZE),
  lastClear: game.lastClear,
})

const hudKey = (hud: HudState) =>
  [
    hud.score,
    hud.lines,
    hud.level,
    hud.hold,
    hud.canHold,
    hud.queue.join(''),
    hud.lastClear?.id,
  ].join('|')

const idleInput = () => ({ left: false, right: false, direction: 0, das: 0, arr: 0, soft: false })

export function useTetris(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [initial] = useState(() => newGame())
  const [phase, setPhase] = useState<Phase>('ready')
  const [hud, setHud] = useState<HudState>(() => hudOf(initial))
  const [best, setBest] = useState(() => loadNumber(STORAGE_KEYS.BEST_TETRIS))
  const [newBest, setNewBest] = useState(false)

  const gameRef = useRef(initial)
  const phaseRef = useRef<Phase>('ready')
  const inputRef = useRef(idleInput())
  const flashRef = useRef<{ rows: number[]; start: number } | null>(null)
  const hudKeyRef = useRef(hudKey(hudOf(initial)))
  const bestRef = useRef(best)
  const overAtRef = useRef(0)

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next
    setPhase(next)
    if (next !== 'playing') inputRef.current = idleInput()
  }, [])

  const sync = useCallback(
    (game: Game) => {
      const previous = gameRef.current
      gameRef.current = game
      if (game.lastClear && game.lastClear.id !== previous.lastClear?.id) {
        flashRef.current = { rows: game.lastClear.rows, start: performance.now() }
      }
      const next = hudOf(game)
      const key = hudKey(next)
      if (key !== hudKeyRef.current) {
        hudKeyRef.current = key
        setHud(next)
      }
      if (game.over && phaseRef.current === 'playing') {
        overAtRef.current = performance.now()
        const isBest = game.score > bestRef.current
        setNewBest(isBest)
        if (isBest) {
          bestRef.current = game.score
          setBest(game.score)
          saveNumber(STORAGE_KEYS.BEST_TETRIS, game.score)
        }
        changePhase('over')
      }
    },
    [changePhase],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const palette = readPalette(canvas)
    let frame = 0
    let last = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(MAX_FRAME_SECONDS, (now - last) / 1000)
      last = now
      const current = phaseRef.current

      if (current === 'playing') {
        let game = gameRef.current
        const input = inputRef.current
        if (input.direction !== 0) {
          input.das += dt
          if (input.das >= INPUT.das) {
            input.arr += dt
            while (input.arr >= INPUT.arr) {
              game = move(game, input.direction)
              input.arr -= INPUT.arr
            }
          }
        }
        sync(tick(game, dt, input.soft))
      }

      const flash = flashRef.current
      let flashState: Flash | null = null
      if (flash) {
        const progress = (now - flash.start) / 1000 / FLASH_SECONDS
        if (progress >= 1) flashRef.current = null
        else flashState = { rows: flash.rows, progress }
      }

      const ctx = fitCanvas(canvas, BOARD.cols, BOARD.rows)
      if (ctx) {
        const game = gameRef.current
        const showPiece = current === 'playing' || current === 'over'
        drawBoard(ctx, palette, {
          board: current === 'paused' ? initial.board : game.board,
          piece: showPiece && !game.over ? game.piece : null,
          ghostY: showPiece && !game.over ? ghostY(game) : null,
          flash: flashState,
        })
      }
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [canvasRef, initial, sync])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === 'playing') changePhase('paused')
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [changePhase])

  const apply = useCallback(
    (update: (game: Game) => Game) => {
      if (phaseRef.current === 'playing') sync(update(gameRef.current))
    },
    [sync],
  )

  const start = useCallback(() => {
    if (phaseRef.current === 'over' && performance.now() - overAtRef.current < RESTART_DELAY_MS)
      return
    const game = newGame()
    gameRef.current = game
    flashRef.current = null
    hudKeyRef.current = hudKey(hudOf(game))
    setHud(hudOf(game))
    setNewBest(false)
    changePhase('playing')
  }, [changePhase])

  const togglePause = useCallback(() => {
    if (phaseRef.current === 'playing') changePhase('paused')
    else if (phaseRef.current === 'paused') changePhase('playing')
  }, [changePhase])

  const pressMove = useCallback(
    (direction: -1 | 1) => {
      if (phaseRef.current !== 'playing') return
      const input = inputRef.current
      if (direction < 0) input.left = true
      else input.right = true
      input.direction = direction
      input.das = 0
      input.arr = 0
      apply((game) => move(game, direction))
    },
    [apply],
  )

  const releaseMove = useCallback((direction: -1 | 1) => {
    const input = inputRef.current
    if (direction < 0) input.left = false
    else input.right = false
    if (input.direction === direction) {
      input.direction = input.left ? -1 : input.right ? 1 : 0
      input.das = 0
      input.arr = 0
    }
  }, [])

  const softDrop = useCallback((on: boolean) => {
    inputRef.current.soft = on && phaseRef.current === 'playing'
  }, [])

  const rotatePiece = useCallback(
    (direction: 1 | -1) => apply((game) => rotate(game, direction)),
    [apply],
  )
  const drop = useCallback(() => apply((game) => hardDrop(game)), [apply])
  const hold = useCallback(() => apply((game) => holdPiece(game)), [apply])

  return {
    phase,
    hud,
    best,
    newBest,
    start,
    togglePause,
    pressMove,
    releaseMove,
    softDrop,
    rotate: rotatePiece,
    hardDrop: drop,
    hold,
  }
}
