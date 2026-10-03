import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

interface StatsProps {
  score: number
  level: number
  lines: number
  best: number
  className?: string
}

export function Stats({ score, level, lines, best, className }: StatsProps) {
  const { t } = useTranslation()
  const items = [
    { label: t('tetris.score'), value: score },
    { label: t('tetris.level'), value: level },
    { label: t('tetris.lines'), value: lines },
    { label: t('tetris.best'), value: best },
  ]

  return (
    <dl className={`${classes.stats} ${className ?? ''}`}>
      {items.map(({ label, value }) => (
        <div key={label} className={classes.item}>
          <dt className={classes.label}>{label}</dt>
          <dd className={classes.value}>{value.toLocaleString('en-US')}</dd>
        </div>
      ))}
    </dl>
  )
}
