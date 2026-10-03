import {
  BOARD,
  CLEAR_POINTS,
  LINES_PER_LEVEL,
  LOCK,
  MAX_LEVEL,
  MIN_SOFT_DROP_SECONDS,
  PIECE_TYPES,
  POINTS,
  QUEUE_SIZE,
  SOFT_DROP_FACTOR,
  SPAWN,
  TOTAL_ROWS,
  gravitySeconds,
} from '../config'
import type { Board, ClearKind, Game, Piece, PieceType, Rotation } from '../types'
import { cellsOf, kicksFor } from './pieces'

type Random = () => number

const LINE_KINDS: ClearKind[] = ['single', 'double', 'triple', 'tetris']
const T_SPIN_KINDS: ClearKind[] = ['t_spin', 't_spin_single', 't_spin_double', 't_spin_triple']

export const emptyBoard = (): Board =>
  Array.from({ length: TOTAL_ROWS }, () => Array.from({ length: BOARD.cols }, () => null))

export const spawnPiece = (type: PieceType): Piece => ({ type, rotation: 0, ...SPAWN })

export const pieceCells = (piece: Piece) =>
  cellsOf(piece.type, piece.rotation).map(([x, y]) => [piece.x + x, piece.y + y] as const)

export function collides(board: Board, piece: Piece): boolean {
  return pieceCells(piece).some(
    ([x, y]) => x < 0 || x >= BOARD.cols || y < 0 || y >= TOTAL_ROWS || board[y][x] !== null,
  )
}

export function fillQueue(queue: PieceType[], random: Random = Math.random): PieceType[] {
  const next = [...queue]
  while (next.length <= QUEUE_SIZE) {
    const bag = [...PIECE_TYPES]
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[bag[i], bag[j]] = [bag[j], bag[i]]
    }
    next.push(...bag)
  }
  return next
}

function enter(game: Game, type: PieceType, queue: PieceType[]): Game {
  const piece = spawnPiece(type)
  return {
    ...game,
    piece,
    queue,
    gravityTimer: 0,
    lockTimer: 0,
    lockResets: 0,
    lowestY: piece.y,
    lastMoveRotate: false,
    over: game.over || collides(game.board, piece),
  }
}

function takeNext(game: Game, random: Random): Game {
  const [type, ...rest] = fillQueue(game.queue, random)
  return enter(game, type, fillQueue(rest, random))
}

export function newGame(random: Random = Math.random): Game {
  const game: Game = {
    board: emptyBoard(),
    piece: spawnPiece('T'),
    hold: null,
    canHold: true,
    queue: [],
    score: 0,
    lines: 0,
    level: 1,
    combo: -1,
    backToBack: false,
    gravityTimer: 0,
    lockTimer: 0,
    lockResets: 0,
    lowestY: 0,
    lastMoveRotate: false,
    lastClear: null,
    over: false,
  }
  return takeNext(game, random)
}

export const isGrounded = (game: Game) =>
  collides(game.board, { ...game.piece, y: game.piece.y + 1 })

function settle(game: Game, piece: Piece, rotated: boolean): Game {
  const grounded = isGrounded(game)
  let { lockTimer, lockResets, lowestY } = game
  if (piece.y > lowestY) {
    lowestY = piece.y
    lockResets = 0
  } else if (grounded && lockResets < LOCK.maxResets) {
    lockTimer = 0
    lockResets += 1
  }
  return { ...game, piece, lockTimer, lockResets, lowestY, lastMoveRotate: rotated }
}

export function move(game: Game, dx: number): Game {
  if (game.over) return game
  const piece = { ...game.piece, x: game.piece.x + dx }
  return collides(game.board, piece) ? game : settle(game, piece, false)
}

export function rotate(game: Game, direction: 1 | -1): Game {
  if (game.over) return game
  const from = game.piece.rotation
  const to = ((from + direction + 4) % 4) as Rotation
  for (const [kx, ky] of kicksFor(game.piece.type, from, to)) {
    const piece = { ...game.piece, rotation: to, x: game.piece.x + kx, y: game.piece.y + ky }
    if (!collides(game.board, piece)) return settle(game, piece, true)
  }
  return game
}

export function ghostY(game: Game): number {
  let y = game.piece.y
  while (!collides(game.board, { ...game.piece, y: y + 1 })) y += 1
  return y
}

function isTSpin(game: Game): boolean {
  const { piece, board } = game
  if (piece.type !== 'T' || !game.lastMoveRotate) return false
  const corners = [
    [piece.x, piece.y],
    [piece.x + 2, piece.y],
    [piece.x, piece.y + 2],
    [piece.x + 2, piece.y + 2],
  ]
  const filled = corners.filter(
    ([x, y]) => x < 0 || x >= BOARD.cols || y >= TOTAL_ROWS || board[y][x] !== null,
  )
  return filled.length >= 3
}

export function lock(game: Game, random: Random = Math.random): Game {
  const cells = pieceCells(game.piece)
  const tSpin = isTSpin(game)
  const placed = game.board.map((row) => [...row])
  cells.forEach(([x, y]) => {
    placed[y][x] = game.piece.type
  })
  if (cells.every(([, y]) => y < BOARD.hidden)) {
    return { ...game, board: placed, over: true }
  }

  const rows = placed.flatMap((row, y) => (row.every((cell) => cell !== null) ? [y] : []))
  const kept = placed.filter((_, y) => !rows.includes(y))
  const board = [...emptyBoard().slice(0, rows.length), ...kept]
  const cleared = rows.length
  const kind = tSpin ? T_SPIN_KINDS[cleared] : cleared > 0 ? LINE_KINDS[cleared - 1] : null

  const difficult = cleared === 4 || (tSpin && cleared > 0)
  const backToBackBonus = difficult && game.backToBack
  const combo = cleared > 0 ? game.combo + 1 : -1
  const perfect = cleared > 0 && board.every((row) => row.every((cell) => cell === null))
  const level = game.level

  let points = kind ? CLEAR_POINTS[kind] * level : 0
  if (backToBackBonus) points *= POINTS.backToBack
  if (combo > 0) points += POINTS.combo * combo * level
  if (perfect) points += POINTS.perfectClear[cleared] * level
  points = Math.round(points)

  const lines = game.lines + cleared
  const next: Game = {
    ...game,
    board,
    score: game.score + points,
    lines,
    level: Math.min(MAX_LEVEL, 1 + Math.floor(lines / LINES_PER_LEVEL)),
    combo,
    backToBack: cleared > 0 ? difficult : game.backToBack,
    canHold: true,
    lastClear: kind
      ? {
          id: (game.lastClear?.id ?? 0) + 1,
          kind,
          rows,
          points,
          combo,
          backToBack: backToBackBonus,
          perfect,
        }
      : game.lastClear,
  }
  return takeNext(next, random)
}

export function hardDrop(game: Game, random: Random = Math.random): Game {
  if (game.over) return game
  const y = ghostY(game)
  const distance = y - game.piece.y
  const dropped: Game = {
    ...game,
    piece: { ...game.piece, y },
    score: game.score + distance * POINTS.hardDrop,
    lastMoveRotate: distance > 0 ? false : game.lastMoveRotate,
  }
  return lock(dropped, random)
}

export function holdPiece(game: Game, random: Random = Math.random): Game {
  if (game.over || !game.canHold) return game
  const held = game.piece.type
  const next =
    game.hold === null
      ? takeNext({ ...game, hold: held }, random)
      : enter({ ...game, hold: held }, game.hold, game.queue)
  return { ...next, canHold: false }
}

export function tick(game: Game, seconds: number, softDrop: boolean, random = Math.random): Game {
  if (game.over) return game
  const interval = softDrop
    ? Math.max(MIN_SOFT_DROP_SECONDS, gravitySeconds(game.level) / SOFT_DROP_FACTOR)
    : gravitySeconds(game.level)
  let current = { ...game, gravityTimer: game.gravityTimer + seconds }

  while (current.gravityTimer >= interval) {
    const piece = { ...current.piece, y: current.piece.y + 1 }
    if (collides(current.board, piece)) {
      current = { ...current, gravityTimer: 0 }
      break
    }
    current = {
      ...settle(current, piece, false),
      gravityTimer: current.gravityTimer - interval,
      score: current.score + (softDrop ? POINTS.softDrop : 0),
    }
  }

  if (!isGrounded(current)) return { ...current, lockTimer: 0 }
  const lockTimer = current.lockTimer + seconds
  return lockTimer >= LOCK.delay ? lock(current, random) : { ...current, lockTimer }
}
