import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

export function HowToPlay() {
  const { t } = useTranslation()

  const items = [
    { keys: ['↑', '↓', '←', '→'], label: t('snake.guide_move') },
    { keys: ['␣'], label: t('snake.guide_pause') },
  ]

  return (
    <div className={classes.root}>
      {items.map((item) => (
        <div key={item.label} className={classes.item}>
          <div className={classes.keys}>
            {item.keys.map((k) => (
              <kbd key={k} className={classes.key}>
                {k}
              </kbd>
            ))}
          </div>
          <span className={classes.label}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
