import { useTranslation } from 'react-i18next'
import type { Phase } from '../../types'
import classes from './index.module.css'

interface OverlayProps {
  phase: Phase
  score: number
  lines: number
  level: number
  newBest: boolean
  onStart: () => void
  onResume: () => void
}

export function Overlay({ phase, score, lines, level, newBest, onStart, onResume }: OverlayProps) {
  const { t } = useTranslation()
  if (phase === 'playing') return null

  return (
    <div className={classes.overlay}>
      {phase === 'ready' && (
        <>
          <p className={classes.title}>{t('tetris.ready_title')}</p>
          <p className={classes.text}>{t('tetris.ready_hint')}</p>
          <button type="button" className={classes.button} autoFocus onClick={onStart}>
            {t('tetris.start')}
          </button>
        </>
      )}

      {phase === 'paused' && (
        <>
          <p className={classes.title}>{t('tetris.paused')}</p>
          <button type="button" className={classes.button} autoFocus onClick={onResume}>
            {t('tetris.resume')}
          </button>
          <button type="button" className={classes.secondary} onClick={onStart}>
            {t('tetris.restart')}
          </button>
        </>
      )}

      {phase === 'over' && (
        <>
          <p className={`${classes.title} ${classes.over}`}>{t('tetris.game_over')}</p>
          {newBest && <p className={classes.best}>{t('tetris.new_best')}</p>}
          <dl className={classes.summary}>
            <dt>{t('tetris.score')}</dt>
            <dd>{score.toLocaleString('en-US')}</dd>
            <dt>{t('tetris.lines')}</dt>
            <dd>{lines}</dd>
            <dt>{t('tetris.level')}</dt>
            <dd>{level}</dd>
          </dl>
          <button type="button" className={classes.button} onClick={onStart}>
            {t('tetris.play_again')}
          </button>
        </>
      )}
    </div>
  )
}
