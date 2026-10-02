import { useTranslation } from 'react-i18next'
import { PixelButton } from '../PixelButton'
import classes from './index.module.css'

export function PauseOverlay({ onResume }: { onResume: () => void }) {
  const { t } = useTranslation()

  return (
    <div className={classes.overlay}>
      <h2 className={classes.title}>{t('flappy.paused')}</h2>
      <PixelButton data-autofocus onClick={onResume}>
        {t('flappy.resume')}
      </PixelButton>
    </div>
  )
}
