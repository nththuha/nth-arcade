import { memo, type CSSProperties, type ReactNode } from 'react'
import { positionsEqual } from '../../logic/gameUtils'
import type { Direction, Position } from '../../types'
import classes from './index.module.css'

interface GameBoardProps {
  snake: Position[]
  food: Position
  boardSize: number
  direction: Direction
}

type CellType = 'snake-head' | 'snake' | 'food' | 'empty'

function getCellType(
  row: number,
  col: number,
  snake: Position[],
  food: Position,
): { type: CellType; index: number } {
  const cell: Position = { row, col }
  if (snake.length > 0 && positionsEqual(snake[0], cell)) return { type: 'snake-head', index: 0 }
  const idx = snake.findIndex((segment) => positionsEqual(segment, cell))
  if (idx !== -1) return { type: 'snake', index: idx }
  if (positionsEqual(cell, food)) return { type: 'food', index: -1 }
  return { type: 'empty', index: -1 }
}

const directionRotation: Record<Direction, string> = {
  RIGHT: 'rotate(0deg)',
  DOWN: 'rotate(90deg)',
  LEFT: 'rotate(180deg)',
  UP: 'rotate(270deg)',
}

function SnakeEyes({ direction }: { direction: Direction }) {
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

function getSnakeColor(index: number, total: number): string {
  const t = total <= 1 ? 0 : index / (total - 1)
  return `color-mix(in srgb, var(--neon-cyan) ${Math.round(t * 100)}%, var(--neon-green))`
}

function GameBoardInner({ snake, food, boardSize, direction }: GameBoardProps) {
  const cells: ReactNode[] = []
  const snakeLen = snake.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const { type, index } = getCellType(row, col, snake, food)
      const key = `${row}-${col}`

      if (type === 'snake-head') {
        const color = getSnakeColor(0, snakeLen)
        const style: CSSProperties = {
          background: color,
          borderRadius: '30%',
          boxShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent), 0 0 16px color-mix(in srgb, ${color} 19%, transparent)`,
        }
        cells.push(
          <div key={key} className={classes.cell} style={style}>
            <SnakeEyes direction={direction} />
          </div>,
        )
      } else if (type === 'snake') {
        const color = getSnakeColor(index, snakeLen)
        const style: CSSProperties = {
          background: color,
          borderRadius: '25%',
          opacity: 1 - (index / snakeLen) * 0.25,
          boxShadow: `0 0 6px color-mix(in srgb, ${color} 25%, transparent)`,
        }
        cells.push(<div key={key} className={classes.cell} style={style} />)
      } else if (type === 'food') {
        cells.push(
          <div key={key} className={`${classes.cell} ${classes.foodCell}`}>
            <div className={classes.food} />
          </div>,
        )
      } else {
        cells.push(<div key={key} className={`${classes.cell} ${classes.empty}`} />)
      }
    }
  }

  return (
    <div className={classes.grid} style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
      {cells}
    </div>
  )
}

export const GameBoard = memo(GameBoardInner)
