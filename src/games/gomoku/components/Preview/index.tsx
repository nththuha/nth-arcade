import { boardOf, type Move } from '../../logic/game'
import '../../styles/colors.css'
import { Board } from '../Board'
import classes from './index.module.css'

const MOVES: Move[] = [
  [7, 7],
  [7, 8],
  [8, 8],
  [6, 6],
  [9, 9],
  [8, 7],
  [6, 8],
  [10, 10],
  [5, 9],
].map(([row, col], i) => ({ row, col, player: i % 2 === 0 ? 1 : 2 }))

export default function PreviewGomoku() {
  return (
    <div className={`theme-gomoku ${classes.frame}`} aria-hidden="true">
      <Board board={boardOf(MOVES)} turn={1} disabled last={MOVES.at(-1)} />
    </div>
  )
}
