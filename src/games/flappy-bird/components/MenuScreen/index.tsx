import { useTranslation } from 'react-i18next'
import { PixelButton } from '../PixelButton'
import classes from './index.module.css'

export function MenuScreen({ best, onStart }: { best: number; onStart: () => void }) {
  const { t } = useTranslation()

  return (
    <div className={classes.screen}>
      <h1 className={classes.title}>Flappy Bird</h1>
      <div className={classes.bottom}>
        <PixelButton data-autofocus onClick={onStart}>
          {t('flappy.start')}
        </PixelButton>
        <p className={classes.best}>
          {t('flappy.best')}: {best}
        </p>
      </div>
    </div>
  )
}
