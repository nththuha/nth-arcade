import { useRef, type PointerEvent } from 'react'
import { BOARD } from '../config'

interface GestureActions {
  move: (direction: -1 | 1) => void
  rotate: (direction: 1 | -1) => void
  hardDrop: () => void
  softDrop: (on: boolean) => void
}

interface Drag {
  id: number
  x: number
  y: number
  time: number
  cells: number
  moved: boolean
  softDropping: boolean
}

const TAP = { distance: 10, ms: 250 }
const FLICK = { cells: 2, speed: 0.7 }

export function useBoardGestures({ move, rotate, hardDrop, softDrop }: GestureActions) {
  const dragRef = useRef<Drag | null>(null)

  const cellSize = (element: HTMLElement) => element.clientWidth / BOARD.cols || 24

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
      cells: 0,
      moved: false,
      softDropping: false,
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    const cell = cellSize(e.currentTarget)
    const target = Math.trunc((e.clientX - drag.x) / cell)
    while (drag.cells !== target) {
      const step = target > drag.cells ? 1 : -1
      move(step)
      drag.cells += step
      drag.moved = true
    }
    const down = e.clientY - drag.y > cell * 1.5 && !drag.moved
    if (down !== drag.softDropping) {
      drag.softDropping = down
      softDrop(down)
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    dragRef.current = null
    if (drag.softDropping) softDrop(false)
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    const elapsed = performance.now() - drag.time
    const cell = cellSize(e.currentTarget)
    if (!drag.moved && dy > cell * FLICK.cells && dy / elapsed > FLICK.speed) {
      hardDrop()
    } else if (
      !drag.moved &&
      Math.abs(dx) < TAP.distance &&
      Math.abs(dy) < TAP.distance &&
      elapsed < TAP.ms
    ) {
      rotate(1)
    }
  }

  const onPointerCancel = () => {
    if (dragRef.current?.softDropping) softDrop(false)
    dragRef.current = null
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
