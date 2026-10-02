import { useEffect, useRef, type RefObject } from 'react'
import { Direction } from '../types'

const MIN_SWIPE_DISTANCE = 30

interface SwipeControlsOptions {
  targetRef?: RefObject<HTMLElement | null>
  onSwipe: (direction: Direction) => void
  enabled?: boolean
}

export function useSwipeControls({ targetRef, onSwipe, enabled = true }: SwipeControlsOptions) {
  const onSwipeRef = useRef(onSwipe)

  useEffect(() => {
    onSwipeRef.current = onSwipe
  }, [onSwipe])

  useEffect(() => {
    if (!enabled) return

    let touchStart: { x: number; y: number } | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStart = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return

      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStart.x
      const dy = touch.clientY - touchStart.y
      touchStart = null

      if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_SWIPE_DISTANCE) return

      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipeRef.current(dx > 0 ? Direction.RIGHT : Direction.LEFT)
      } else {
        onSwipeRef.current(dy > 0 ? Direction.DOWN : Direction.UP)
      }
    }

    const target: HTMLElement | Window = targetRef?.current ?? window
    const opts: AddEventListenerOptions = { passive: true }

    target.addEventListener('touchstart', handleTouchStart as EventListener, opts)
    target.addEventListener('touchend', handleTouchEnd as EventListener, opts)

    return () => {
      target.removeEventListener('touchstart', handleTouchStart as EventListener)
      target.removeEventListener('touchend', handleTouchEnd as EventListener)
    }
  }, [enabled, targetRef])
}
