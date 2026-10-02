import { useTranslation } from 'react-i18next'
import { GameLayout } from '@/shared/components/GameLayout'
import { PauseIcon, PlayIcon, RotateCcwIcon } from '@/shared/components/icons'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useCallback, useRef, useState } from 'react'
import { useGameAudio } from './hooks/useGameAudio'
import { useSnakeGame } from './hooks/useSnakeGame'
import { useSwipeControls } from './hooks/useSwipeControls'
import { BOARD_SIZE } from './types'
import { GameBoard } from './components/GameBoard'
import { GameOverDialog } from './components/GameOverDialog'
import { HowToPlay } from './components/HowToPlay'
import { MobileControls } from './components/MobileControls'
import { ParticleBackground } from './components/ParticleBackground'
import { ScoreDisplay } from './components/ScoreDisplay'
import classes from './index.module.css'
import './styles/colors.css'
import { SoundToggle } from './components/SoundToggle'
import { SpeedSlider } from './components/SpeedSlider'

export default function SnakeGame() {
  const { t } = useTranslation()
  useDocumentTitle(t('games.snake.title'))

  const {
    snake,
    food,
    score,
    highScore,
    gameOver,
    paused,
    started,
    direction,
    speed,
    setSpeed,
    restart,
    togglePause,
    changeDirection,
  } = useSnakeGame(BOARD_SIZE)

  const audio = useGameAudio()
  const [muted, setMuted] = useState(true)
  const boardRef = useRef<HTMLDivElement>(null)

  useSwipeControls({
    targetRef: boardRef,
    onSwipe: changeDirection,
    enabled: !gameOver,
  })

  const handleSoundToggle = useCallback(() => {
    if (muted) {
      audio.start()
    } else {
      audio.stop()
    }
    setMuted(!muted)
  }, [muted, audio])

  return (
    <GameLayout
      className={`theme-snake ${classes.page}`}
      decor={
        <>
          <div className={classes.orbs}>
            <div className={`${classes.orb} ${classes.orbGreen}`} />
            <div className={`${classes.orb} ${classes.orbPurple}`} />
            <div className={`${classes.orb} ${classes.orbCyan}`} />
          </div>

          <ParticleBackground />
        </>
      }
    >
      <div className={classes.cardWrap}>
        <div className={classes.card}>
          <div className={classes.headerRow}>
            <h1 className={classes.title}>🐍 SNAKE</h1>
            <SoundToggle muted={muted} onToggle={handleSoundToggle} />
          </div>

          <ScoreDisplay score={score} highScore={highScore} />

          <div ref={boardRef} className={classes.boardWrap}>
            <GameBoard snake={snake} food={food} boardSize={BOARD_SIZE} direction={direction} />

            {!started && !gameOver && (
              <div className={`${classes.overlay} ${classes.startOverlay}`}>
                <div className={classes.startEmoji}>🎮</div>
                <span className={classes.startText}>{t('snake.press_to_start')}</span>
                <div className={classes.startKeys}>
                  {['↑', '↓', '←', '→'].map((k) => (
                    <kbd key={k} className={classes.startKey}>
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            )}

            {paused && started && (
              <div className={`${classes.overlay} ${classes.pausedOverlay}`}>
                <PauseIcon className={classes.pausedIcon} />
                <span className={classes.pausedText}>{t('snake.paused')}</span>
              </div>
            )}
          </div>

          <div className={classes.controlsRow}>
            <button
              type="button"
              onClick={togglePause}
              disabled={gameOver || !started}
              className={`${classes.controlButton} ${classes.pauseButton}`}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
              {paused ? t('snake.resume') : t('snake.pause')}
            </button>

            <button
              type="button"
              onClick={restart}
              className={`${classes.controlButton} ${classes.restartButton}`}
            >
              <RotateCcwIcon />
              {t('snake.restart')}
            </button>

            <div className={classes.speedWrap}>
              <SpeedSlider speed={speed} onChange={setSpeed} />
            </div>
          </div>

          <HowToPlay />

          <MobileControls onDirection={changeDirection} />

          <GameOverDialog
            isOpen={gameOver}
            score={score}
            highScore={highScore}
            onRestart={restart}
          />
        </div>
      </div>
    </GameLayout>
  )
}
