import { useTranslation } from 'react-i18next'
import { FLASH_EVERY } from '../../config'
import classes from './index.module.css'

const pad = (value: number) => String(Math.min(value, 99999)).padStart(5, '0')

export function Hud({ score, highScore }: { score: number; highScore: number }) {
  const { t } = useTranslation()
  const milestone = Math.floor(score / FLASH_EVERY)

  return (
    <div className={classes.hud}>
      {highScore > 0 && (
        <span className={classes.high} aria-label={`${t('dino.high_score')}: ${highScore}`}>
          HI {pad(highScore)}
        </span>
      )}
      <span
        key={milestone}
        className={`${classes.score} ${milestone > 0 ? classes.flash : ''}`}
        aria-label={`${t('dino.score')}: ${score}`}
      >
        {pad(score)}
      </span>
    </div>
  )
}
