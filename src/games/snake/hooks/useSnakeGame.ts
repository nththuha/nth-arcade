import { STORAGE_KEYS, loadNumber, saveNumber } from '@/shared/storage'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  calculateTickInterval,
  getNextHead,
  isSelfCollision,
  isValidDirectionChange,
  positionsEqual,
  spawnFood,
  wrapPosition,
} from '../logic/gameUtils'
import {
  BOARD_SIZE,
  Direction,
  INITIAL_DIRECTION,
  INITIAL_SNAKE_LENGTH,
  type Position,
} from '../types'

export interface UseSnakeGameReturn {
  snake: Position[]
  food: Position
  score: number
  highScore: number
  gameOver: boolean
  paused: boolean
  started: boolean
  direction: Direction
  speed: number
  setSpeed: (speed: number) => void
  restart: () => void
  togglePause: () => void
  changeDirection: (newDirection: Direction) => void
}

function createInitialSnake(boardSize: number): Position[] {
  const snake: Position[] = []
  const startRow = Math.floor(boardSize / 2)
  const startCol = Math.floor(boardSize / 2) - 1
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ row: startRow, col: startCol - i })
  }
  return snake
}

interface GameTickState {
  snake: Position[]
  food: Position
  score: number
}

function createInitialState(boardSize: number): GameTickState {
  const snake = createInitialSnake(boardSize)
  return { snake, food: spawnFood(snake, boardSize)!, score: 0 }
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
}

export function useSnakeGame(boardSize: number = BOARD_SIZE): UseSnakeGameReturn {
  const [initialState] = useState(() => createInitialState(boardSize))

  const [snake, setSnake] = useState<Position[]>(initialState.snake)
  const [food, setFood] = useState<Position>(initialState.food)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => loadNumber(STORAGE_KEYS.BEST_SNAKE))
  const [gameOver, setGameOver] = useState(false)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [paused, setPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const [speed, setSpeed] = useState(5)

  const directionRef = useRef<Direction>(INITIAL_DIRECTION)
  const directionQueueRef = useRef<Direction[]>([])
  const stateRef = useRef<GameTickState>(initialState)

  useLayoutEffect(() => {
    stateRef.current = { snake, food, score }
  }, [snake, food, score])

  const restart = useCallback(() => {
    const next = createInitialState(boardSize)
    setSnake(next.snake)
    setFood(next.food)
    setScore(0)
    setGameOver(false)
    setDirection(INITIAL_DIRECTION)
    setPaused(false)
    setStarted(false)
    directionRef.current = INITIAL_DIRECTION
    directionQueueRef.current = []
    stateRef.current = next
  }, [boardSize])

  const togglePause = useCallback(() => {
    if (!gameOver) {
      setPaused((prev) => !prev)
    }
  }, [gameOver])

  useEffect(() => {
    if (gameOver || paused || !started) {
      return
    }

    const tick = () => {
      const { snake: currentSnake, food: currentFood, score: currentScore } = stateRef.current

      const queue = directionQueueRef.current
      while (queue.length > 0) {
        const candidate = queue.shift()!
        if (isValidDirectionChange(directionRef.current, candidate)) {
          directionRef.current = candidate
          break
        }
      }

      const currentDirection = directionRef.current
      const nextHead = wrapPosition(getNextHead(currentSnake[0], currentDirection), boardSize)

      if (isSelfCollision(nextHead, currentSnake)) {
        setGameOver(true)
        if (currentScore > loadNumber(STORAGE_KEYS.BEST_SNAKE)) {
          setHighScore(currentScore)
          saveNumber(STORAGE_KEYS.BEST_SNAKE, currentScore)
        }
        return
      }

      setDirection(currentDirection)

      if (positionsEqual(nextHead, currentFood)) {
        const newSnake = [nextHead, ...currentSnake]
        const newScore = currentScore + 1
        const newFood = spawnFood(newSnake, boardSize) ?? currentFood
        setSnake(newSnake)
        setFood(newFood)
        setScore(newScore)
        stateRef.current = { snake: newSnake, food: newFood, score: newScore }
      } else {
        const newSnake = [nextHead, ...currentSnake.slice(0, -1)]
        setSnake(newSnake)
        stateRef.current = { ...stateRef.current, snake: newSnake }
      }
    }

    const interval = setInterval(tick, calculateTickInterval(score, speed))
    return () => clearInterval(interval)
  }, [gameOver, paused, started, score, speed, boardSize])

  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (gameOver || paused) return

      if (!started) {
        if (isValidDirectionChange(INITIAL_DIRECTION, newDirection)) {
          directionRef.current = newDirection
          directionQueueRef.current = []
        }
        setStarted(true)
        return
      }

      const queue = directionQueueRef.current
      const effective = queue.length > 0 ? queue[queue.length - 1] : directionRef.current

      if (isValidDirectionChange(effective, newDirection) && queue.length < 2) {
        queue.push(newDirection)
      }
    },
    [gameOver, paused, started],
  )

  useEffect(() => {
    if (gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        togglePause()
        return
      }

      const newDirection = KEY_DIRECTIONS[e.key]
      if (!newDirection) return

      e.preventDefault()
      changeDirection(newDirection)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, togglePause, changeDirection])

  return {
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
  }
}
