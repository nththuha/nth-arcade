import { useTranslation } from 'react-i18next'
import {
  SIZE,
  type Board as BoardState,
  type Move,
  type Player,
  type Point,
} from '../../logic/game'
import classes from './index.module.css'

const STARS: Point[] = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11],
]

interface BoardProps {
  board: BoardState
  turn: Player
  last?: Move
  win?: Point[] | null
  disabled?: boolean
  onPlace?: (row: number, col: number) => void
}

export function Board({ board, turn, last, win, disabled, onPlace }: BoardProps) {
  const { t } = useTranslation()
  const winning = new Set(win?.map(([r, c]) => r * SIZE + c))

  return (
    <div className={classes.board} data-turn={turn}>
      <div className={classes.lattice} aria-hidden="true">
        {STARS.map(([r, c]) => (
          <i key={`${r}-${c}`} className={classes.star} style={{ '--r': r, '--c': c } as object} />
        ))}
      </div>
      <div className={classes.grid} role="grid" aria-label={t('gomoku.board')}>
        {board.map((cells, r) =>
          cells.map((player, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              className={classes.cell}
              disabled={disabled || player !== 0}
              aria-label={`${r + 1}, ${c + 1}${player ? ` · ${t(`gomoku.player_${player}`)}` : ''}`}
              onClick={() => onPlace?.(r, c)}
            >
              {player !== 0 && (
                <span
                  className={`${classes.stone} ${player === 1 ? classes.black : classes.white} ${
                    winning.has(r * SIZE + c) ? classes.win : ''
                  }`}
                >
                  {last?.row === r && last.col === c && <b className={classes.last} />}
                </span>
              )}
            </button>
          )),
        )}
      </div>
    </div>
  )
}
