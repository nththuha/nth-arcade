import { GameLayout } from '@/shared/components/GameLayout'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useTranslation } from 'react-i18next'
import Board from './components/Board'
import Button from './components/Button'
import Footer from './components/Footer'
import Instruction from './components/Instruction'
import Score from './components/Score'
import { use2048Game } from './hooks/use2048Game'
import classes from './index.module.css'
import './styles/colors.css'

export default function Game2048() {
  const { t } = useTranslation()
  const { tiles, score, bestScore, gameOver, won, resetGame, continueGame } = use2048Game()
  useDocumentTitle('2048')

  return (
    <GameLayout className={`theme-2048 ${classes.container}`}>
      <div className={classes.content}>
        <h1 className={classes.header}>2048</h1>
        <Score score={score} bestScore={bestScore} />
        <Button fullWidth onClick={resetGame}>
          {t('game2048.new_game')}
        </Button>
        <Instruction />
        <Board
          tiles={Object.values(tiles)}
          won={won}
          gameOver={gameOver}
          resetGame={resetGame}
          continueGame={continueGame}
        />
        <Footer />
      </div>
    </GameLayout>
  )
}
