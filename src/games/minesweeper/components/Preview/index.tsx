import '../../styles/colors.css'
import type { Cell as CellData } from '../../types'
import { Cell } from '../Cell'
import classes from './index.module.css'

const LAYOUT = ['h1000001h', 'h2100001f', 'hf100112h', 'h21001fhh', 'hh21012hh', 'hhhhhhhhh']

const CELLS: CellData[] = LAYOUT.join('')
  .split('')
  .map((ch) =>
    ch === 'h'
      ? { mine: false, adjacent: 0, state: 'hidden' }
      : ch === 'f'
        ? { mine: true, adjacent: 0, state: 'flagged' }
        : { mine: false, adjacent: Number(ch), state: 'revealed' },
  )

export default function PreviewMinesweeper() {
  return (
    <div
      className={`theme-minesweeper ${classes.board}`}
      style={{ gridTemplateColumns: `repeat(${LAYOUT[0].length}, var(--cell-size))` }}
      aria-hidden="true"
    >
      {CELLS.map((cell, i) => (
        <Cell
          key={i}
          index={i}
          cell={cell}
          status="won"
          exploded={false}
          pressed={false}
          mineDelay={0}
          animate={false}
        />
      ))}
    </div>
  )
}
