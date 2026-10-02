import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

type ScoreProps = {
  score: number
  bestScore: number
}

export default function Score({ score, bestScore }: ScoreProps) {
  const { t } = useTranslation()

  return (
    <div className={classes.grid}>
      <Item label={t('game2048.score')} score={score} />
      <Item label={t('game2048.best')} score={bestScore} />
    </div>
  )
}

function Item({ label, score }: { label: string; score: number }) {
  return (
    <div className={classes.itemContainer}>
      <span className={classes.label}>{label.toUpperCase()}</span>
      <span className={classes.score}>{score}</span>
    </div>
  )
}
