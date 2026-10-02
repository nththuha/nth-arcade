import { useTranslation } from 'react-i18next'
import { winPercentage } from '../../logic/stats'
import type { DifficultyStats } from '../../types'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import classes from './index.module.css'

export interface GameResult {
  won: boolean
  time: number
  stats: DifficultyStats | null
  bestTimeRank: number | null
  date: string
}

interface ResultDialogProps {
  result: GameResult
  onExit: () => void
  onRestart: () => void
  onPlayAgain: () => void
}

export function ResultDialog({ result, onExit, onRestart, onPlayAgain }: ResultDialogProps) {
  const { t, i18n } = useTranslation()
  const { won, time, stats, bestTimeRank, date } = result
  const bestTime = stats?.bestTimes[0]?.time

  return (
    <Dialog
      title={won ? t('minesweeper.wonTitle') : t('minesweeper.lostTitle')}
      onClose={onPlayAgain}
      footer={
        <>
          <Button onClick={onExit}>{t('minesweeper.exit')}</Button>
          {!won && <Button onClick={onRestart}>{t('minesweeper.restartThisGame')}</Button>}
          <Button data-autofocus onClick={onPlayAgain}>
            {t('minesweeper.playAgain')}
          </Button>
        </>
      }
    >
      <p className={classes.message}>
        {won ? t('minesweeper.wonMessage') : t('minesweeper.lostMessage')}
      </p>

      {won && bestTimeRank === 0 && (
        <p className={classes.highlight}>{t('minesweeper.newBestTime')}</p>
      )}

      <div className={classes.columns}>
        <ul className={classes.list}>
          <li>{t('minesweeper.resultTime', { value: time })}</li>
          {stats && (
            <li>
              {bestTime === undefined
                ? t('minesweeper.resultBestTimeNone')
                : t('minesweeper.resultBestTime', { value: bestTime })}
            </li>
          )}
          {won && (
            <li>
              {t('minesweeper.resultDate', {
                value: new Date(date).toLocaleDateString(i18n.resolvedLanguage),
              })}
            </li>
          )}
        </ul>
        {stats && (
          <ul className={classes.list}>
            <li>{t('minesweeper.resultPlayed', { value: stats.played })}</li>
            <li>{t('minesweeper.resultWon', { value: stats.won })}</li>
            <li>{t('minesweeper.resultPercentage', { value: winPercentage(stats) })}</li>
          </ul>
        )}
      </div>

      {!stats && <p className={classes.note}>{t('minesweeper.customNoStats')}</p>}
    </Dialog>
  )
}
