import { useTranslation } from 'react-i18next'
import { CrownIcon, RotateCcwIcon, TrophyIcon, ZapIcon } from '@/shared/components/icons'
import { useEffect, useRef } from 'react'
import classes from './index.module.css'

export interface GameOverDialogProps {
  isOpen: boolean
  score: number
  highScore: number
  onRestart: () => void
}

export function GameOverDialog({ isOpen, score, highScore, onRestart }: GameOverDialogProps) {
  const { t } = useTranslation()
  const restartRef = useRef<HTMLButtonElement>(null)
  const isNewHigh = score > 0 && score >= highScore

  useEffect(() => {
    if (isOpen) restartRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={classes.backdrop}>
      <div
        className={classes.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snake-game-over-title"
      >
        <div className={classes.header}>
          <div className={classes.emoji}>{isNewHigh ? '🏆' : '💀'}</div>
          <h2 id="snake-game-over-title" className={classes.title}>
            {t('snake.game_over')}
          </h2>
          {isNewHigh && (
            <div className={classes.badge}>
              <CrownIcon />
              {t('snake.new_high_score')}
            </div>
          )}
        </div>

        <div className={classes.cards}>
          <div className={`${classes.card} ${classes.cardGreen}`}>
            <div className={classes.cardGlow} />
            <div className={classes.cardIcon}>
              <ZapIcon />
            </div>
            <span className={classes.cardLabel}>{t('snake.final_score')}</span>
            <span className={classes.cardValue}>{score}</span>
          </div>

          <div className={`${classes.card} ${isNewHigh ? classes.cardYellow : classes.cardPurple}`}>
            <div className={classes.cardGlow} />
            <div className={classes.cardIcon}>
              <TrophyIcon />
            </div>
            <span className={classes.cardLabel}>{t('snake.best_score')}</span>
            <span className={classes.cardValue}>{highScore}</span>
          </div>
        </div>

        <button ref={restartRef} type="button" onClick={onRestart} className={classes.restart}>
          <RotateCcwIcon />
          {t('snake.restart')}
        </button>
      </div>
    </div>
  )
}
