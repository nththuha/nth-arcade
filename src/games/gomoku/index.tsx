import { GameLayout } from '@/shared/components/GameLayout'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { STORAGE_KEYS, loadNumber, saveNumber } from '@/shared/storage'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Board } from './components/Board'
import classes from './index.module.css'
import { aiMove } from './logic/ai'
import { SIZE, boardOf, winLine, type Move, type Player } from './logic/game'
import './styles/colors.css'

type Mode = 'ai' | 'pvp'

const AI_DELAY_MS = 450

const Stone = ({ player }: { player: Player }) => (
  <span className={`${classes.stone} ${player === 1 ? classes.black : classes.white}`} />
)

export default function GomokuGame() {
  const { t } = useTranslation()
  useDocumentTitle(t('games.gomoku.title'))
  const [mode, setMode] = useState<Mode>('ai')
  const [human, setHuman] = useState<Player>(1)
  const [moves, setMoves] = useState<Move[]>([])
  const [wins, setWins] = useState(() => loadNumber(STORAGE_KEYS.BEST_GOMOKU))

  const board = useMemo(() => boardOf(moves), [moves])
  const last = moves.at(-1)
  const win = useMemo(() => (last ? winLine(board, last.row, last.col) : null), [board, last])
  const draw = !win && moves.length === SIZE * SIZE
  const over = !!win || draw
  const turn: Player = moves.length % 2 === 0 ? 1 : 2
  const aiTurn = mode === 'ai' && turn !== human && !over

  const place = (row: number, col: number) => {
    setMoves((m) => [...m, { row, col, player: turn }])
    if (
      mode === 'ai' &&
      turn === human &&
      winLine({ ...board, [row]: board[row].with(col, turn) }, row, col)
    ) {
      setWins(wins + 1)
      saveNumber(STORAGE_KEYS.BEST_GOMOKU, wins + 1)
    }
  }

  useEffect(() => {
    if (!aiTurn) return
    const id = setTimeout(() => {
      const pick = aiMove(board, turn)
      if (pick) place(pick[0], pick[1])
    }, AI_DELAY_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- place only reads `turn`
  }, [aiTurn, board, turn])

  const winner = win && last ? last.player : null
  const humanWon = mode === 'ai' && winner === human
  const reset = (nextMode = mode, nextHuman = human) => {
    setMode(nextMode)
    setHuman(nextHuman)
    setMoves([])
  }
  // In AI mode take back the AI's reply too, so it is the player's turn again.
  const undo = () => setMoves((m) => m.slice(0, mode === 'ai' && m.length > 1 ? -2 : -1))

  const status = winner
    ? mode === 'ai'
      ? t(humanWon ? 'gomoku.you_win' : 'gomoku.ai_wins')
      : t('gomoku.wins', { player: t(`gomoku.player_${winner}`) })
    : draw
      ? t('gomoku.draw')
      : aiTurn
        ? t('gomoku.thinking')
        : t('gomoku.turn', { player: t(`gomoku.player_${turn}`) })

  return (
    <GameLayout className={`theme-gomoku ${classes.page}`}>
      <div className={classes.game}>
        <h1 className={classes.title}>{t('games.gomoku.title')}</h1>

        <div className={classes.toolbar}>
          <div className={classes.segment} role="group" aria-label={t('gomoku.mode')}>
            {(['ai', 'pvp'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => mode !== m && reset(m)}
              >
                {t(`gomoku.mode_${m}`)}
              </button>
            ))}
          </div>
          {mode === 'ai' && (
            <div className={classes.segment} role="group" aria-label={t('gomoku.side')}>
              {([1, 2] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={human === p}
                  onClick={() => human !== p && reset(mode, p)}
                >
                  <Stone player={p} />
                  {t(p === 1 ? 'gomoku.first' : 'gomoku.second')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={classes.status} role="status" data-over={over}>
          {!over && <Stone player={turn} />}
          {winner && <Stone player={winner} />}
          <span>{status}</span>
          {mode === 'ai' && (
            <span className={classes.wins}>
              {t('gomoku.wins_vs_ai')}: {wins}
            </span>
          )}
        </div>

        <Board
          board={board}
          turn={turn}
          last={last}
          win={win}
          disabled={over || aiTurn}
          onPlace={place}
        />

        <div className={classes.actions}>
          <button type="button" className={classes.primary} onClick={() => reset()}>
            {t('gomoku.new_game')}
          </button>
          <button type="button" onClick={undo} disabled={moves.length === 0 || aiTurn}>
            {t('gomoku.undo')}
          </button>
        </div>
        <p className={classes.hint}>{t('gomoku.hint')}</p>
      </div>
    </GameLayout>
  )
}
