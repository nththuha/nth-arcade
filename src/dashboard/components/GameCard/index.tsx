import type { GameEntry } from '@/games/registry'
import { PlayIcon, TrophyIcon } from '@/shared/components/icons'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import classes from './index.module.css'

type GameCardProps = {
  game: GameEntry
  best: string
  style?: CSSProperties
}

export function GameCard({ game, best, style }: GameCardProps) {
  const { t } = useTranslation()
  const { Preview } = game

  return (
    <Link to={game.path} className={classes.card} style={style}>
      <div className={classes.screen}>
        <Preview />
      </div>

      <div className={classes.body}>
        <h3 className={classes.title}>{t(`games.${game.id}.title`)}</h3>
        <p className={classes.description}>{t(`games.${game.id}.description`)}</p>
        <p className={classes.controls}>
          <span className={classes.controlsLabel}>{t('dashboard.controls')}</span>
          {t(`games.${game.id}.controls`)}
        </p>
      </div>

      <div className={classes.footer}>
        <span className={classes.best}>
          <TrophyIcon className={classes.bestIcon} />
          <span className={classes.bestLabel}>{t('dashboard.best')}</span>
          <span className={classes.bestValue}>{best}</span>
        </span>
        <span className={classes.play}>
          <PlayIcon className={classes.playIcon} />
          {t('dashboard.play')}
        </span>
      </div>
    </Link>
  )
}
