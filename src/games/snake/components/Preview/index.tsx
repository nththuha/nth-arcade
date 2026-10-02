import '../../styles/colors.css'
import { Direction } from '../../types'
import { SnakeEyes } from '../SnakeEyes'
import classes from './index.module.css'

const COLS = 14
const ROWS = 8

const SNAKE: [number, number][] = [
  [3, 9],
  [3, 8],
  [3, 7],
  [3, 6],
  [4, 6],
  [5, 6],
  [5, 5],
  [5, 4],
  [5, 3],
  [4, 3],
  [3, 3],
  [2, 3],
]
const FOOD: [number, number] = [3, 11]

function snakeColor(index: number) {
  const percent = Math.round((index / (SNAKE.length - 1)) * 100)
  return `color-mix(in srgb, var(--neon-cyan) ${percent}%, var(--neon-green))`
}

export default function PreviewSnake() {
  const cells = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = SNAKE.findIndex(([r, c]) => r === row && c === col)
      if (index !== -1) {
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`${classes.cell} ${index === 0 ? classes.head : ''}`}
            style={{ background: snakeColor(index), opacity: 1 - (index / SNAKE.length) * 0.25 }}
          >
            {index === 0 && <SnakeEyes direction={Direction.RIGHT} />}
          </div>,
        )
      } else if (row === FOOD[0] && col === FOOD[1]) {
        cells.push(
          <div key={`${row}-${col}`} className={`${classes.cell} ${classes.foodCell}`}>
            <div className={classes.food} />
          </div>,
        )
      } else {
        cells.push(<div key={`${row}-${col}`} className={`${classes.cell} ${classes.empty}`} />)
      }
    }
  }

  return (
    <div className={`theme-snake ${classes.board}`} aria-hidden="true">
      {cells}
    </div>
  )
}
