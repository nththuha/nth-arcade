import { useEffect, useState } from 'react'
import { MAX_TIME } from '../config'
import {
  chord as chordCell,
  countFlags,
  cycleMark,
  newGame,
  restartSameBoard,
  reveal as revealCell,
} from '../logic/board'
import type { BoardSize, GameState } from '../types'

interface Options {
  allowQuestionMarks: boolean
  onGameEnd: (won: boolean, time: number) => void
}

export function useMinesweeper(size: BoardSize, { allowQuestionMarks, onGameEnd }: Options) {
  const [game, setGame] = useState(() => newGame(size))
  const [time, setTime] = useState(0)

  useEffect(() => {
    if (game.status !== 'playing') return
    const interval = setInterval(() => setTime((t) => Math.min(MAX_TIME, t + 1)), 1000)
    return () => clearInterval(interval)
  }, [game.status])

  const apply = (next: GameState) => {
    if (next === game) return
    const started = game.status === 'ready' && next.status !== 'ready'
    if (started) setTime(1)
    setGame(next)

    const ended = (next.status === 'won' || next.status === 'lost') && next.status !== game.status
    if (ended) onGameEnd(next.status === 'won', started ? 1 : time)
  }

  return {
    game,
    time,
    minesLeft: game.board.mines - countFlags(game.board),
    reveal: (index: number) => apply(revealCell(game, index)),
    chord: (index: number) => apply(chordCell(game, index)),
    mark: (index: number) => {
      apply(cycleMark(game, index, allowQuestionMarks))
    },
    startNew: (nextSize: BoardSize = size) => {
      setGame(newGame(nextSize))
      setTime(0)
    },
    restart: () => {
      setGame(restartSameBoard(game))
      setTime(0)
    },
  }
}
