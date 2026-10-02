import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@/shared/components/icons'
import { memo } from 'react'
import { Direction } from '../../types'
import classes from './index.module.css'

interface MobileControlsProps {
  onDirection: (direction: Direction) => void
}

function MobileControlsInner({ onDirection }: MobileControlsProps) {
  return (
    <div className={classes.root} aria-label="Directional controls">
      <button
        type="button"
        className={classes.button}
        onPointerDown={() => onDirection(Direction.UP)}
        aria-label="Move up"
      >
        <ChevronUpIcon />
      </button>

      <div className={classes.row}>
        <button
          type="button"
          className={classes.button}
          onPointerDown={() => onDirection(Direction.LEFT)}
          aria-label="Move left"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          className={classes.button}
          onPointerDown={() => onDirection(Direction.DOWN)}
          aria-label="Move down"
        >
          <ChevronDownIcon />
        </button>
        <button
          type="button"
          className={classes.button}
          onPointerDown={() => onDirection(Direction.RIGHT)}
          aria-label="Move right"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}

export const MobileControls = memo(MobileControlsInner)
