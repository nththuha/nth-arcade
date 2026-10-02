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
      <p className={classes.text}>{won ? t('game2048.youWin') : t('game2048.gameOver')}</p>

      <Button onClick={won ? continueGame : resetGame}>
        {won ? t('game2048.keepGoing') : t('game2048.tryAgain')}
      </Button>
    </div>
  )
}
