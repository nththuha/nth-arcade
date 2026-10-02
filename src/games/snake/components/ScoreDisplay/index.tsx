import { useTranslation } from 'react-i18next'
import { TrophyIcon, ZapIcon } from '@/shared/components/icons'
import classes from './index.module.css'

interface ScoreDisplayProps {
  score: number
  highScore: number
}

export function ScoreDisplay({ score, highScore }: ScoreDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className={classes.row}>
      <div className={`${classes.box} ${classes.scoreBox}`}>
        <ZapIcon className={`${classes.icon} ${classes.iconGreen}`} />
        <div className={classes.texts}>
          <span className={classes.label}>{t('snake.score')}</span>
          <span
            key={score}
            className={`${classes.value} ${classes.valueGreen} ${score > 0 ? classes.pop : ''}`}
          >
            {score}
          </span>
        </div>
      </div>

      <div className={`${classes.box} ${classes.bestBox}`}>
        <TrophyIcon className={`${classes.icon} ${classes.iconPurple}`} />
        <div className={classes.texts}>
          <span className={classes.label}>{t('snake.bestScore')}</span>
          <span className={`${classes.value} ${classes.valuePurple}`}>{highScore}</span>
        </div>
      </div>
    </div>
  )
}
