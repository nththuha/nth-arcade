import { useTranslation } from 'react-i18next'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { LONG_PRESS_MS, TOUCH_MOVE_TOLERANCE } from '../../config'
import { neighbors } from '../../logic/board'
import type { GameState } from '../../types'
import { Cell } from '../Cell'
import classes from './index.module.css'

interface BoardProps {
  game: GameState
  animate: boolean
  flagMode: boolean
  onReveal: (index: number) => void
  onMark: (index: number) => void
  onChord: (index: number) => void
  onPressingChange: (pressing: boolean) => void
}

interface Press {
  index: number
  chord: boolean
}

interface TouchPress {
  index: number
  x: number
  y: number
  timer: ReturnType<typeof setTimeout>
  longPressed: boolean
}

function cellIndexOf(target: EventTarget | null): number | null {
  const el = (target as HTMLElement | null)?.closest<HTMLElement>('[data-index]')
  return el ? Number(el.dataset.index) : null
}

export function Board({
  game,
  animate,
  flagMode,
  onReveal,
  onMark,
  onChord,
  onPressingChange,
}: BoardProps) {
  const { t } = useTranslation()
  const { board, status, explodedIndex } = game
  const finished = status === 'won' || status === 'lost'
  const [press, setPress] = useState<Press | null>(null)
  const touchRef = useRef<TouchPress | null>(null)
  const lastTouchRef = useRef(0)

  useEffect(() => {
    if (!press) return
    const cancel = () => setPress(null)
    window.addEventListener('mouseup', cancel)
    return () => window.removeEventListener('mouseup', cancel)
  }, [press])

  useEffect(() => () => clearTimeout(touchRef.current?.timer), [])

  useEffect(() => {
    onPressingChange(press !== null)
  }, [press, onPressingChange])

  const isRevealedNumber = (index: number) => {
    const cell = board.cells[index]
    return cell.state === 'revealed' && cell.adjacent > 0
  }

  const isEmulatedMouse = () => performance.now() - lastTouchRef.current < 800

  const handleMouseDown = (e: MouseEvent) => {
    const index = cellIndexOf(e.target)
    if (index === null || finished || isEmulatedMouse()) return
    e.preventDefault()

    if (e.button === 0) {
      setPress({ index, chord: (e.buttons & 2) !== 0 || isRevealedNumber(index) })
    } else if (e.button === 2) {
      if (e.buttons & 1) setPress({ index, chord: true })
      else onMark(index)
    } else if (e.button === 1) {
      setPress({ index, chord: true })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!press) return
    const index = cellIndexOf(e.target)
    if (index !== null && index !== press.index) setPress({ ...press, index })
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!press) return
    e.stopPropagation()
    const index = cellIndexOf(e.target)
    setPress(null)
    if (index === null) return
    if (press.chord) onChord(index)
    else onReveal(index)
  }

  const cancelTouch = () => {
    clearTimeout(touchRef.current?.timer)
    touchRef.current = null
    setPress(null)
  }

  const handlePointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' || finished) return
    const index = cellIndexOf(e.target)
    if (index === null) return
    e.preventDefault()
    lastTouchRef.current = performance.now()

    const timer = setTimeout(() => {
      if (!touchRef.current) return
      touchRef.current.longPressed = true
      setPress(null)
      navigator.vibrate?.(25)
      onMark(index)
    }, LONG_PRESS_MS)
    touchRef.current = { index, x: e.clientX, y: e.clientY, timer, longPressed: false }
    if (!flagMode) setPress({ index, chord: isRevealedNumber(index) })
  }

  const handlePointerMove = (e: PointerEvent) => {
    const touch = touchRef.current
    if (!touch || e.pointerType === 'mouse') return
    if (Math.hypot(e.clientX - touch.x, e.clientY - touch.y) > TOUCH_MOVE_TOLERANCE) cancelTouch()
  }

  const handlePointerUp = (e: PointerEvent) => {
    const touch = touchRef.current
    if (!touch || e.pointerType === 'mouse') return
    lastTouchRef.current = performance.now()
    clearTimeout(touch.timer)
    touchRef.current = null
    setPress(null)
    if (touch.longPressed) return
    if (flagMode) onMark(touch.index)
    else onReveal(touch.index)
  }

  const pressed = new Set<number>()
  if (press && !finished) {
    const targets = press.chord
      ? [press.index, ...neighbors(press.index, board.rows, board.cols)]
      : [press.index]
    for (const i of targets) {
      const state = board.cells[i].state
      if (state === 'hidden' || state === 'question') pressed.add(i)
    }
  }

  const mineDelay = (index: number) => {
    if (status !== 'lost' || explodedIndex === null) return 0
    const dr = Math.abs(Math.floor(index / board.cols) - Math.floor(explodedIndex / board.cols))
    const dc = Math.abs((index % board.cols) - (explodedIndex % board.cols))
    return Math.min(Math.max(dr, dc) * 70, 1400)
  }

  const style = {
    '--cols': board.cols,
    '--max-cell': board.cols <= 9 && board.rows <= 9 ? '32px' : '26px',
  } as CSSProperties

  return (
    <div
      className={classes.board}
      style={style}
      role="grid"
      aria-label={t('minesweeper.board')}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelTouch}
      onContextMenu={(e) => e.preventDefault()}
    >
      {board.cells.map((cell, index) => (
        <Cell
          key={index}
          index={index}
          cell={cell}
          status={status}
          exploded={index === explodedIndex}
          pressed={pressed.has(index)}
          mineDelay={cell.mine ? mineDelay(index) : 0}
          animate={animate}
        />
      ))}
    </div>
  )
}
