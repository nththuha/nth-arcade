import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

interface HudProps {
  score: number
  showPause: boolean
  paused: boolean
  onTogglePause: () => void
}

export function Hud({ score, showPause, paused, onTogglePause }: HudProps) {
  const { t } = useTranslation()

  return (
    <>
      {showPause && (
        <button
          type="button"
          className={classes.pause}
          aria-label={paused ? t('flappy.resume') : t('flappy.pause')}
          aria-pressed={paused}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTogglePause}
        >
          <span className={paused ? classes.playIcon : classes.pauseIcon} />
        </button>
      )}
      <div className={classes.score} aria-live="polite">
        {score}
      </div>
    </>
  )
}
