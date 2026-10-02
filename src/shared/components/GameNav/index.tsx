import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ArrowLeftIcon } from '../icons'
import { LanguageToggle } from '../LanguageToggle'
import classes from './index.module.css'

type GameNavProps = {
  className?: string
}

export function GameNav({ className }: GameNavProps) {
  const { t } = useTranslation()

  return (
    <nav className={`${classes.root} ${className ?? ''}`}>
      <Link to="/" className={classes.back}>
        <ArrowLeftIcon className={classes.backIcon} />
        {t('common.backToArcade')}
      </Link>
      <LanguageToggle />
    </nav>
  )
}
