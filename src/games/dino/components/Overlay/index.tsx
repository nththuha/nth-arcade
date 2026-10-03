import { useTranslation } from 'react-i18next'
import type { Phase } from '../../types'
import classes from './index.module.css'

export function Overlay({ phase, onRestart }: { phase: Phase; onRestart: () => void }) {
  const { t } = useTranslation()

  if (phase === 'waiting') {
    return <p className={classes.hint}>{t('dino.start_hint')}</p>
  }
  if (phase !== 'over') return null

  return (
    <div className={classes.over} role="alert">
      <p className={classes.title}>GAME OVER</p>
      <button
        type="button"
        className={classes.restart}
        aria-label={t('dino.restart')}
        title={t('dino.restart')}
        onClick={onRestart}
        onMouseDown={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 36 32" aria-hidden="true">
          <path d="M4 4h28v24H4z" className={classes.box} />
          <path d="M18 9a7 7 0 1 0 7 7" className={classes.arrow} />
          <path d="M21 5l5 4-5 4" className={classes.arrowHead} />
        </svg>
      </button>
    </div>
  )
}
