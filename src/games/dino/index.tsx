import { GameLayout } from '@/shared/components/GameLayout'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useEffect, useRef, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Hud } from './components/Hud'
import { Overlay } from './components/Overlay'
import { NIGHT_EVERY } from './config'
import { useDinoGame } from './hooks/useDinoGame'
import classes from './index.module.css'
import './styles/colors.css'

const JUMP_KEYS = new Set([' ', 'ArrowUp', 'w', 'W'])
const DUCK_KEYS = new Set(['ArrowDown', 's', 'S'])

export default function DinoGame() {
  const { t } = useTranslation()
  useDocumentTitle(t('games.dino.title'))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useDinoGame(canvasRef)
  const { pressJump, release, duck, restart } = game

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('button')) return
      if (JUMP_KEYS.has(e.key)) {
        e.preventDefault()
        if (!e.repeat) pressJump()
      } else if (DUCK_KEYS.has(e.key)) {
        e.preventDefault()
        duck(true)
      } else if (e.key === 'Enter') {
        restart()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (JUMP_KEYS.has(e.key)) release()
      else if (DUCK_KEYS.has(e.key)) duck(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [pressJump, release, duck, restart])

  const handlePointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    pressJump()
  }

  const night = Math.floor(game.score / NIGHT_EVERY) % 2 === 1

  return (
    <GameLayout className={`theme-dino ${classes.page}`}>
      <div
        className={`${classes.stage} ${night ? classes.night : ''}`}
        role="application"
        aria-label={t('dino.stage')}
        onPointerDown={handlePointerDown}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <canvas ref={canvasRef} className={classes.canvas} />
        <Hud score={game.score} highScore={game.highScore} />
        <Overlay phase={game.phase} onRestart={restart} />
        <p className={classes.controls}>{t('dino.controls_hint')}</p>
      </div>
    </GameLayout>
  )
}
