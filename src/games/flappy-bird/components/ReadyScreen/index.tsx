import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

export function ReadyScreen() {
  const { t } = useTranslation()

  return (
    <div className={classes.screen}>
      <h2 className={classes.title}>Get Ready</h2>
      <div className={classes.hint}>
        <span className={classes.arrow}>▲</span>
        <span className={classes.tap}>{t('flappy.tap')}</span>
      </div>
      <p className={classes.text}>{t('flappy.hint')}</p>
    </div>
  )
}
