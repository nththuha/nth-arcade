import { useTranslation } from 'react-i18next'
import { medalFor } from '../../config'
import { PixelButton } from '../PixelButton'
import classes from './index.module.css'

interface GameOverPanelProps {
  score: number
  best: number
  newBest: boolean
  onPlayAgain: () => void
  onMenu: () => void
}

export function GameOverPanel({ score, best, newBest, onPlayAgain, onMenu }: GameOverPanelProps) {
  const { t } = useTranslation()
  const medal = medalFor(score)

  return (
    <div className={classes.screen}>
      <h2 className={classes.title}>Game Over</h2>

      <div className={classes.panel}>
        <div className={classes.medalBox}>
          <span className={classes.label}>{t('flappy.medal')}</span>
          <span
            className={classes.medal}
            style={{ background: medal ? `var(--medal-${medal})` : 'var(--medal-empty)' }}
            aria-label={medal ?? undefined}
          />
        </div>
        <div className={classes.scores}>
          <span className={classes.label}>{t('flappy.score')}</span>
          <span className={classes.number}>{score}</span>
          <span className={classes.label}>
            {t('flappy.best')}
            {newBest && <span className={classes.badge}>{t('flappy.new_best')}</span>}
          </span>
          <span className={classes.number}>{best}</span>
        </div>
      </div>

      <div className={classes.buttons}>
        <PixelButton data-autofocus onClick={onPlayAgain}>
          {t('flappy.play_again')}
        </PixelButton>
        <PixelButton onClick={onMenu}>{t('flappy.menu')}</PixelButton>
      </div>
    </div>
  )
}
