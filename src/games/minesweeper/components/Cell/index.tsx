import { memo, type CSSProperties } from 'react'
import type { Cell as CellData, GameStatus } from '../../types'
import { FlagIcon, MineIcon, WrongFlagIcon } from '../Icons'
import classes from './index.module.css'

interface CellProps {
  index: number
  cell: CellData
  status: GameStatus
  exploded: boolean
  pressed: boolean
  mineDelay: number
  animate: boolean
}

function CellView({ index, cell, status, exploded, pressed, mineDelay, animate }: CellProps) {
  const lost = status === 'lost'
  const classNames = [classes.cell]
  let content = null
  let style: CSSProperties | undefined

  if (cell.state === 'revealed') {
    classNames.push(classes.revealed)
    if (cell.mine) {
      if (exploded) classNames.push(classes.exploded)
      content = <MineIcon className={classes.icon} />
    } else if (cell.adjacent > 0) {
      style = { color: `var(--num-${cell.adjacent})` }
      content = cell.adjacent
    }
  } else if (lost && cell.mine && cell.state !== 'flagged') {
    classNames.push(classes.revealed, classes.mineShown)
    style = { animationDelay: `${mineDelay}ms` }
    content = <MineIcon className={classes.icon} />
  } else if (lost && cell.state === 'flagged' && !cell.mine) {
    classNames.push(classes.revealed)
    content = <WrongFlagIcon className={classes.icon} />
  } else if (pressed && cell.state !== 'flagged') {
    classNames.push(classes.pressed)
  } else {
    classNames.push(classes.hidden)
    if (cell.state === 'flagged') {
      content = <FlagIcon className={`${classes.icon} ${classes.flag}`} />
    } else if (cell.state === 'question') {
      content = <span className={classes.question}>?</span>
    }
  }

  if (animate) classNames.push(classes.animate)

  return (
    <div className={classNames.join(' ')} style={style} data-index={index} role="gridcell">
      {content}
    </div>
  )
}

export const Cell = memo(CellView)
