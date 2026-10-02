import type { Direction } from '../../types'
import classes from './index.module.css'

const directionRotation: Record<Direction, string> = {
  RIGHT: 'rotate(0deg)',
  DOWN: 'rotate(90deg)',
  LEFT: 'rotate(180deg)',
  UP: 'rotate(270deg)',
}

export function SnakeEyes({ direction }: { direction: Direction }) {
  return (
    <div className={classes.eyes} style={{ transform: directionRotation[direction] }}>
      <div className={`${classes.eye} ${classes.eyeTop}`}>
        <div className={classes.pupil} />
      </div>
      <div className={`${classes.eye} ${classes.eyeBottom}`}>
        <div className={classes.pupil} />
      </div>
    </div>
  )
}
