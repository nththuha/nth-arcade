import { useEffect, useRef, type CSSProperties } from 'react'
import { GAP, MOVE_ANIMATION_DURATION, WIDTH, tileColor } from '../../config'
import type { Position, TileProps } from '../../types'
import classes from './index.module.css'

const positionToPixels = (position: number) => GAP / 2 + position * (WIDTH + GAP)

export default function Tile({
  currentPosition,
  previousPosition,
  value,
  isMerged = false,
}: TileProps) {
  const tileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!previousPosition || areSamePosition(currentPosition, previousPosition)) {
      return
    }

    const startTop = positionToPixels(previousPosition[0])
    const startLeft = positionToPixels(previousPosition[1])
    const endTop = positionToPixels(currentPosition[0])
    const endLeft = positionToPixels(currentPosition[1])

    let startTime: number | null = null
    let frame: number

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp
      }
      const progress = Math.min((timestamp - startTime) / MOVE_ANIMATION_DURATION, 1)

      if (tileRef.current) {
        tileRef.current.style.top = `${startTop + (endTop - startTop) * progress}px`
        tileRef.current.style.left = `${startLeft + (endLeft - startLeft) * progress}px`
      }

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    if (tileRef.current) {
      tileRef.current.style.top = `${startTop}px`
      tileRef.current.style.left = `${startLeft}px`
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [currentPosition, previousPosition])

  const containerStyle: CSSProperties = {
    top: positionToPixels(currentPosition[0]),
    left: positionToPixels(currentPosition[1]),
    zIndex: value,
    backgroundColor: tileColor(value),
  }

  const textStyle: CSSProperties = {
    color: value <= 4 ? 'var(--text-color)' : 'var(--secondary-text)',
  }

  const animationClass = isMerged ? classes.merge : !previousPosition ? classes.appearing : ''

  return (
    <div ref={tileRef} className={`${classes.container} ${animationClass}`} style={containerStyle}>
      <span className={classes.text} style={textStyle}>
        {value}
      </span>
    </div>
  )
}

function areSamePosition(pos1: Position, pos2: Position) {
  return pos1[0] === pos2[0] && pos1[1] === pos2[1]
}
