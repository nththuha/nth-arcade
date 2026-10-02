import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RANKED_DIFFICULTIES } from '../../config'
import { emptyStats, winPercentage } from '../../logic/stats'
import type { RankedDifficulty, Stats } from '../../types'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import classes from './index.module.css'

interface StatisticsDialogProps {
  stats: Stats
  initialDifficulty: RankedDifficulty
  onChange: (stats: Stats) => void
  onClose: () => void
}

export function StatisticsDialog({
  stats,
  initialDifficulty,
  onChange,
  onClose,
}: StatisticsDialogProps) {
  const { t, i18n } = useTranslation()
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [confirmReset, setConfirmReset] = useState(false)
  const s = stats[difficulty]

  const rows = [
    [t('minesweeper.stat_played'), s.played],
    [t('minesweeper.stat_won'), s.won],
    [t('minesweeper.stat_percentage'), `${winPercentage(s)}%`],
    [t('minesweeper.stat_longest_win'), s.longestWinStreak],
    [t('minesweeper.stat_longest_lose'), s.longestLoseStreak],
    [t('minesweeper.stat_current_streak'), s.currentStreak],
  ] as const

  const footer = confirmReset ? (
    <>
      <span className={classes.confirm}>{t('minesweeper.reset_confirm')}</span>
      <Button
        onClick={() => {
          onChange(emptyStats())
          setConfirmReset(false)
        }}
      >
        {t('minesweeper.yes')}
      </Button>
      <Button data-autofocus onClick={() => setConfirmReset(false)}>
        {t('minesweeper.no')}
      </Button>
    </>
  ) : (
    <>
      <Button onClick={() => setConfirmReset(true)}>{t('minesweeper.reset')}</Button>
      <Button data-autofocus onClick={onClose}>
        {t('minesweeper.close')}
      </Button>
    </>
  )

  return (
    <Dialog
      title={t('minesweeper.statistics')}
      onClose={onClose}
      footer={footer}
      className={classes.wide}
    >
      <div className={classes.layout}>
        <div className={classes.levels} role="listbox" aria-label={t('minesweeper.difficulty')}>
          {RANKED_DIFFICULTIES.map((id) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={id === difficulty}
              className={classes.level}
              onClick={() => setDifficulty(id)}
            >
              {t(`minesweeper.${id}`)}
            </button>
          ))}
        </div>

        <div className={classes.details}>
          <div>
            <h3 className={classes.heading}>{t('minesweeper.best_times')}</h3>
            {s.bestTimes.length === 0 ? (
              <p className={classes.muted}>{t('minesweeper.no_times')}</p>
            ) : (
              <ol className={classes.times}>
                {s.bestTimes.map((best, i) => (
                  <li key={i}>
                    <span className={classes.time}>{best.time}</span>
                    <span className={classes.muted}>
                      {new Date(best.date).toLocaleDateString(i18n.resolvedLanguage)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <dl className={classes.numbers}>
            {rows.map(([label, value]) => (
              <div key={label} className={classes.row}>
                <dt>{label}:</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Dialog>
  )
}
