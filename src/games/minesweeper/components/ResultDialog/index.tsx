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
      title={won ? t('minesweeper.won_title') : t('minesweeper.lost_title')}
      onClose={onPlayAgain}
      footer={
        <>
          <Button onClick={onExit}>{t('minesweeper.exit')}</Button>
          {!won && <Button onClick={onRestart}>{t('minesweeper.restart_this_game')}</Button>}
          <Button data-autofocus onClick={onPlayAgain}>
            {t('minesweeper.play_again')}
          </Button>
        </>
      }
    >
      <p className={classes.message}>
        {won ? t('minesweeper.won_message') : t('minesweeper.lost_message')}
      </p>

      {won && bestTimeRank === 0 && (
        <p className={classes.highlight}>{t('minesweeper.new_best_time')}</p>
      )}

      <div className={classes.columns}>
        <ul className={classes.list}>
          <li>{t('minesweeper.result_time', { value: time })}</li>
          {stats && (
            <li>
              {bestTime === undefined
                ? t('minesweeper.result_best_time_none')
                : t('minesweeper.result_best_time', { value: bestTime })}
            </li>
          )}
          {won && (
            <li>
              {t('minesweeper.result_date', {
                value: new Date(date).toLocaleDateString(i18n.resolvedLanguage),
              })}
            </li>
          )}
        </ul>
        {stats && (
          <ul className={classes.list}>
            <li>{t('minesweeper.result_played', { value: stats.played })}</li>
            <li>{t('minesweeper.result_won', { value: stats.won })}</li>
            <li>{t('minesweeper.result_percentage', { value: winPercentage(stats) })}</li>
          </ul>
        )}
      </div>

      {!stats && <p className={classes.note}>{t('minesweeper.custom_no_stats')}</p>}
    </Dialog>
  )
}
