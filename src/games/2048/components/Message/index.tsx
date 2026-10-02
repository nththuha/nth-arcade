import { useTranslation } from 'react-i18next'
import Button from '../Button'
import classes from './index.module.css'

type MessageProps = {
  won: boolean
  resetGame: () => void
  continueGame: () => void
}

export default function Message({ won, resetGame, continueGame }: MessageProps) {
  const { t } = useTranslation()

  return (
    <div className={classes.container}>
      <p className={classes.text}>{won ? t('game2048.you_win') : t('game2048.game_over')}</p>

      <Button onClick={won ? continueGame : resetGame}>
        {won ? t('game2048.keep_going') : t('game2048.try_again')}
      </Button>
    </div>
  )
}
