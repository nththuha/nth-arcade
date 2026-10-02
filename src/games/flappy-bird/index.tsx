import { GameLayout } from '@/shared/components/GameLayout'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useEffect, useRef, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { GameOverPanel } from './components/GameOverPanel'
import { Hud } from './components/Hud'
import { MenuScreen } from './components/MenuScreen'
import { PauseOverlay } from './components/PauseOverlay'
import { ReadyScreen } from './components/ReadyScreen'
import { useFlappyGame } from './hooks/useFlappyGame'
import classes from './index.module.css'
import './styles/colors.css'

const ACTION_KEYS = new Set([' ', 'ArrowUp', 'w', 'W'])
const PAUSE_KEYS = new Set(['p', 'P', 'Escape'])

export default function FlappyBird() {
  const { t } = useTranslation()
  useDocumentTitle(t('games.flappy_bird.title'))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const game = useFlappyGame(canvasRef)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (ACTION_KEYS.has(e.key)) {
        if ((e.target as HTMLElement).closest('button')) return
        e.preventDefault()
        game.action()
      } else if (PAUSE_KEYS.has(e.key)) {
        e.preventDefault()
        game.togglePause()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    stageRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
  }, [game.phase, game.paused])

  const handlePointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (game.phase === 'menu' || game.phase === 'over') return
    e.preventDefault()
    game.action()
  }

  const showScore = game.phase !== 'menu' && game.phase !== 'over'

  return (
    <GameLayout className={`theme-flappy ${classes.page}`}>
      <div
        ref={stageRef}
        className={classes.stage}
        role="application"
        aria-label={t('flappy.stage')}
        onPointerDown={handlePointerDown}
      >
        <canvas ref={canvasRef} className={classes.canvas} />

        {showScore && (
          <Hud
            score={game.score}
            showPause={game.phase === 'playing'}
            paused={game.paused}
            onTogglePause={game.togglePause}
          />
        )}
        {game.phase === 'menu' && <MenuScreen best={game.best} onStart={game.getReady} />}
        {game.phase === 'ready' && <ReadyScreen />}
        {game.phase === 'over' && (
          <GameOverPanel
            score={game.score}
            best={game.best}
            newBest={game.newBest}
            onPlayAgain={game.getReady}
            onMenu={game.toMenu}
          />
        )}
        {game.paused && <PauseOverlay onResume={game.togglePause} />}
        {game.flashes > 0 && <div key={game.flashes} className={classes.flash} />}
      </div>
    </GameLayout>
  )
}
