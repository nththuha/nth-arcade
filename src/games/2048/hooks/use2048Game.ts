import { STORAGE_KEYS, loadNumber, saveNumber } from '@/shared/storage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MOVE_ANIMATION_DURATION, SWIPE_THRESHOLD } from '../config'
import { canMove, createRandomTile, initializeGame, moveTiles } from '../logic/board'
import type { Board, Direction, Tiles } from '../types'

const ANIMATION_LOCK_MS = Math.max(MOVE_ANIMATION_DURATION, 50)

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export function use2048Game() {
  const [initialState] = useState(initializeGame)
  const [board, setBoard] = useState<Board>(initialState.board)
  const [tiles, setTiles] = useState<Tiles>(initialState.tiles)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => loadNumber(STORAGE_KEYS.BEST_2048))
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const isAnimating = useRef(false)

  const move = useCallback(
    (direction: Direction) => {
      if (gameOver || won || isAnimating.current) {
        return
      }

      isAnimating.current = true
      setTimeout(() => {
        isAnimating.current = false
      }, ANIMATION_LOCK_MS)

      const result = moveTiles(board, tiles, direction)
      if (!result.moved) {
        return
      }

      const newBoard = result.board
      const newTiles = result.tiles
      const newTile = createRandomTile(newBoard)
      if (newTile) {
        newBoard[newTile.currentPosition[0]][newTile.currentPosition[1]] = newTile.id
        newTiles[newTile.id] = newTile
      }

      const newScore = score + result.scoreGained
      setBoard(newBoard)
      setTiles(newTiles)
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        saveNumber(STORAGE_KEYS.BEST_2048, newScore)
      }
      if (result.reachedWinningTile && !hasWon) {
        setHasWon(true)
        setWon(true)
      }
      if (!canMove(newBoard, newTiles)) {
        setGameOver(true)
      }
    },
    [bestScore, board, gameOver, hasWon, score, tiles, won],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[e.key]
      if (!direction) return
      e.preventDefault()
      move(direction)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  useEffect(() => {
    let touchStart: { x: number; y: number } | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStart = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) {
        return
      }

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      touchStart = null

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > SWIPE_THRESHOLD) {
          move('right')
        } else if (deltaX < -SWIPE_THRESHOLD) {
          move('left')
        }
      } else {
        if (deltaY > SWIPE_THRESHOLD) {
          move('down')
        } else if (deltaY < -SWIPE_THRESHOLD) {
          move('up')
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [move])

  const resetGame = useCallback(() => {
    const { board, tiles } = initializeGame()
    setBoard(board)
    setTiles(tiles)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setHasWon(false)
  }, [])

  const continueGame = useCallback(() => {
    setWon(false)
    setGameOver(false)
  }, [])

  return {
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    resetGame,
    continueGame,
  }
}
