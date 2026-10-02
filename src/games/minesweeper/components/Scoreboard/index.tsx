import { useTranslation } from 'react-i18next'
import { FlagIcon } from '../Icons'
import { LedDisplay } from '../LedDisplay'
import { Smiley, type Mood } from '../Smiley'
import classes from './index.module.css'

interface ScoreboardProps {
  minesLeft: number
  time: number
  mood: Mood
  flagMode: boolean
  onNewGame: () => void
  onToggleFlagMode: () => void
}

export function Scoreboard({
  minesLeft,
  time,
  mood,
  flagMode,
  onNewGame,
  onToggleFlagMode,
}: ScoreboardProps) {
  const { t } = useTranslation()

  return (
    <div className={classes.panel}>
      <LedDisplay value={minesLeft} label={t('minesweeper.minesLeft')} />

      <div className={classes.center}>
        <button
          type="button"
          className={classes.face}
          aria-label={t('minesweeper.newGame')}
          title={`${t('minesweeper.newGame')} (F2)`}
          onClick={onNewGame}
        >
          <Smiley mood={mood} className={classes.smiley} />
        </button>

        <button
          type="button"
          className={classes.flagMode}
          aria-pressed={flagMode}
          aria-label={t('minesweeper.flagMode')}
          title={t('minesweeper.flagMode')}
          onClick={onToggleFlagMode}
        >
          <FlagIcon className={classes.flagIcon} />
        </button>
      </div>

      <LedDisplay value={time} label={t('minesweeper.time')} />
    </div>
  )
}
