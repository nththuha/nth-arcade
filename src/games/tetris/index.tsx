import { GameLayout } from '@/shared/components/GameLayout'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ClearPopup } from './components/ClearPopup'
import { Overlay } from './components/Overlay'
import { PiecePreview } from './components/PiecePreview'
import { Stats } from './components/Stats'
import { TouchControls } from './components/TouchControls'
import { useBoardGestures } from './hooks/useBoardGestures'
import { useTetris } from './hooks/useTetris'
import classes from './index.module.css'
import './styles/colors.css'

const TITLE = ['T', 'E', 'T', 'R', 'I', 'S']
const TITLE_COLORS = ['z', 'l', 'o', 's', 'i', 't']

export default function TetrisGame() {
  const { t } = useTranslation()
  useDocumentTitle(t('games.tetris.title'))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useTetris(canvasRef)
  const {
    phase,
    hud,
    start,
    togglePause,
    pressMove,
    releaseMove,
    softDrop,
    rotate,
    hardDrop,
    hold,
  } = game
  const gestures = useBoardGestures({ move: pressMove, rotate, hardDrop, softDrop })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey) return
      const onButton = (e.target as HTMLElement).closest('button') !== null
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if ((key === 'Enter' || key === ' ') && onButton) return

      const handled = (() => {
        switch (key) {
          case 'ArrowLeft':
            if (!e.repeat) pressMove(-1)
            return true
          case 'ArrowRight':
            if (!e.repeat) pressMove(1)
            return true
          case 'ArrowDown':
            softDrop(true)
            return true
          case 'ArrowUp':
          case 'x':
            if (!e.repeat) rotate(1)
            return true
          case 'z':
          case 'Control':
            if (!e.repeat) rotate(-1)
            return true
          case ' ':
            if (!e.repeat) hardDrop()
            return true
          case 'c':
          case 'Shift':
            hold()
            return true
          case 'Escape':
          case 'p':
            togglePause()
            return true
          case 'Enter':
            if (phase === 'paused') togglePause()
            else if (phase !== 'playing') start()
            return true
          default:
            return false
        }
      })()
      if (handled) e.preventDefault()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') releaseMove(-1)
      else if (e.key === 'ArrowRight') releaseMove(1)
      else if (e.key === 'ArrowDown') softDrop(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [phase, start, togglePause, pressMove, releaseMove, softDrop, rotate, hardDrop, hold])

  const touchProps = {
    onMove: pressMove,
    onMoveEnd: releaseMove,
    onSoftDrop: softDrop,
    onRotate: rotate,
    onHardDrop: hardDrop,
    onHold: hold,
  }

  return (
    <GameLayout className={`theme-tetris ${classes.page}`}>
      <div className={classes.game}>
        <div className={classes.left}>
          <h1 className={classes.title} aria-label={t('games.tetris.title')}>
            {TITLE.map((letter, i) => (
              <span key={i} className={classes[`letter_${TITLE_COLORS[i]}`]}>
                {letter}
              </span>
            ))}
          </h1>
          <section className={`${classes.panel} ${classes.hold}`}>
            <h2 className={classes.panelLabel}>{t('tetris.hold')}</h2>
            <PiecePreview type={hud.hold} dimmed={!hud.canHold} />
          </section>
          <Stats
            className={classes.stats}
            score={hud.score}
            level={hud.level}
            lines={hud.lines}
            best={Math.max(game.best, hud.score)}
          />
          <TouchControls group="move" className={classes.moveControls} {...touchProps} />
        </div>

        <div className={classes.board}>
          <canvas
            ref={canvasRef}
            className={classes.canvas}
            role="img"
            aria-label={t('tetris.board')}
            {...gestures}
          />
          {phase === 'playing' && <ClearPopup clear={hud.lastClear} />}
          <Overlay
            phase={phase}
            score={hud.score}
            lines={hud.lines}
            level={hud.level}
            newBest={game.newBest}
            onStart={start}
            onResume={togglePause}
          />
        </div>

        <div className={classes.right}>
          <section className={`${classes.panel} ${classes.next}`}>
            <h2 className={classes.panelLabel}>{t('tetris.next')}</h2>
            {hud.queue.map((type, i) => (
              <div key={i} className={classes.nextItem}>
                <PiecePreview type={type} small={i > 0} />
              </div>
            ))}
          </section>
          <TouchControls group="action" className={classes.actionControls} {...touchProps} />
        </div>

        <p className={classes.hint}>{t('tetris.controls_hint')}</p>
      </div>
    </GameLayout>
  )
}
