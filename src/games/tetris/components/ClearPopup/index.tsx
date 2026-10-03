import { useTranslation } from 'react-i18next'
import type { ClearEvent } from '../../types'
import classes from './index.module.css'

export function ClearPopup({ clear }: { clear: ClearEvent | null }) {
  const { t } = useTranslation()
  if (!clear) return null

  return (
    <div key={clear.id} className={classes.popup} aria-live="polite">
      {clear.backToBack && <span className={classes.extra}>{t('tetris.back_to_back')}</span>}
      <span className={`${classes.kind} ${clear.kind === 'tetris' ? classes.tetris : ''}`}>
        {t(`tetris.clear.${clear.kind}`)}
      </span>
      {clear.combo > 0 && (
        <span className={classes.extra}>{t('tetris.combo', { value: clear.combo })}</span>
      )}
      {clear.perfect && <span className={classes.extra}>{t('tetris.perfect_clear')}</span>}
      {clear.points > 0 && <span className={classes.points}>+{clear.points}</span>}
    </div>
  )
}
