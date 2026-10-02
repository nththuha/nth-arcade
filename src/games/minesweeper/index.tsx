import { GameNav } from '@/shared/components/GameNav'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Board } from './components/Board'
import { HelpDialog } from './components/HelpDialog'
import { MineIcon } from './components/Icons'
import { InProgressDialog } from './components/InProgressDialog'
import { MenuBar, type Menu } from './components/MenuBar'
import { OptionsDialog } from './components/OptionsDialog'
import { ResultDialog, type GameResult } from './components/ResultDialog'
import { StatisticsDialog } from './components/StatisticsDialog'
import { Scoreboard } from './components/Scoreboard'
import type { Mood } from './components/Smiley'
import { TitleBar } from './components/TitleBar'
import { RANKED_DIFFICULTIES, sizeOf } from './config'
import { useMinesweeper } from './hooks/useMinesweeper'
import { useSettings } from './hooks/useSettings'
import { useStats } from './hooks/useStats'
import { recordGame } from './logic/stats'
import type { DifficultyId, RankedDifficulty, Settings } from './types'
import classes from './index.module.css'
import './styles/colors.css'

type DialogState =
  | { type: 'result'; result: GameResult }
  | { type: 'inProgress'; action: () => void }
  | { type: 'statistics' }
  | { type: 'options' }
  | { type: 'help' }
  | null

const isRanked = (difficulty: DifficultyId): difficulty is RankedDifficulty =>
  difficulty !== 'custom'

export default function Minesweeper() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useDocumentTitle(t('games.minesweeper.title'))

  const [settings, setSettings] = useSettings()
  const [stats, setStats] = useStats()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [flagMode, setFlagMode] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [gameDifficulty, setGameDifficulty] = useState(settings.difficulty)
  const resultTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resultTimer.current), [])

  const record = (won: boolean, time: number): GameResult => {
    const date = new Date().toISOString()
    if (!isRanked(gameDifficulty)) return { won, time, stats: null, bestTimeRank: null, date }
    const { stats: next, bestTimeRank } = recordGame(stats, gameDifficulty, won, time, date)
    setStats(next)
    return { won, time, stats: next[gameDifficulty], bestTimeRank, date }
  }

  const ms = useMinesweeper(sizeOf(settings), {
    allowQuestionMarks: settings.questionMarks,
    onGameEnd: (won, time) => {
      const result = record(won, time)
      resultTimer.current = setTimeout(
        () => setDialog({ type: 'result', result }),
        settings.animations ? (won ? 700 : 1500) : 250,
      )
    },
  })

  const startNewGame = (next: Settings = settings) => {
    clearTimeout(resultTimer.current)
    setGameDifficulty(next.difficulty)
    setFlagMode(false)
    ms.startNew(sizeOf(next))
  }

  const requestNewGame = (action: () => void) => {
    if (ms.game.status === 'playing') setDialog({ type: 'inProgress', action })
    else action()
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (dialog) return
      if (e.key === 'F2') {
        e.preventDefault()
        requestNewGame(() => startNewGame())
      } else if (e.key === 'F4') {
        e.preventDefault()
        setDialog({ type: 'statistics' })
      } else if (e.key === 'F5') {
        e.preventDefault()
        setDialog({ type: 'options' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const changeSettings = (next: Settings) => {
    const boardChanged =
      next.difficulty !== settings.difficulty ||
      JSON.stringify(sizeOf(next)) !== JSON.stringify(sizeOf(settings))
    setSettings(next)
    if (boardChanged) requestNewGame(() => startNewGame(next))
  }

  const menus: Menu[] = [
    {
      label: t('minesweeper.menuGame'),
      items: [
        {
          label: t('minesweeper.newGame'),
          shortcut: 'F2',
          onSelect: () => requestNewGame(() => startNewGame()),
        },
        ...RANKED_DIFFICULTIES.map((difficulty, i) => ({
          label: t(`minesweeper.${difficulty}`),
          checked: settings.difficulty === difficulty,
          separator: i === 0,
          onSelect: () => changeSettings({ ...settings, difficulty }),
        })),
        {
          label: t('minesweeper.customMenu'),
          checked: settings.difficulty === 'custom',
          onSelect: () => setDialog({ type: 'options' }),
        },
        {
          label: t('minesweeper.marks'),
          checked: settings.questionMarks,
          separator: true,
          onSelect: () => setSettings({ ...settings, questionMarks: !settings.questionMarks }),
        },
        {
          label: t('minesweeper.statistics'),
          shortcut: 'F4',
          separator: true,
          onSelect: () => setDialog({ type: 'statistics' }),
        },
        {
          label: t('minesweeper.options'),
          shortcut: 'F5',
          onSelect: () => setDialog({ type: 'options' }),
        },
        { label: t('minesweeper.exit'), separator: true, onSelect: () => navigate('/') },
      ],
    },
    {
      label: t('minesweeper.menuHelp'),
      items: [{ label: t('minesweeper.howToPlay'), onSelect: () => setDialog({ type: 'help' }) }],
    },
  ]

  const mood: Mood =
    ms.game.status === 'lost'
      ? 'dead'
      : ms.game.status === 'won'
        ? 'cool'
        : pressing
          ? 'oh'
          : 'smile'

  const closeDialog = () => setDialog(null)

  return (
    <div className={`theme-minesweeper ${classes.page}`}>
      <div className={classes.stack}>
        <GameNav />

        <div className={classes.window}>
          <TitleBar
            title={t('minesweeper.title')}
            icon={<MineIcon />}
            closeLabel={t('minesweeper.exit')}
            minimizeLabel={t('minesweeper.minimize')}
            maximizeLabel={t('minesweeper.maximize')}
            onClose={() => navigate('/')}
          />

          <div className={classes.client}>
            <MenuBar menus={menus} />
            <div className={classes.game}>
              <Scoreboard
                minesLeft={ms.minesLeft}
                time={ms.time}
                mood={mood}
                flagMode={flagMode}
                onNewGame={() => requestNewGame(() => startNewGame())}
                onToggleFlagMode={() => setFlagMode(!flagMode)}
              />
              <div className={classes.boardScroll}>
                <Board
                  game={ms.game}
                  animate={settings.animations}
                  flagMode={flagMode}
                  onReveal={ms.reveal}
                  onMark={ms.mark}
                  onChord={ms.chord}
                  onPressingChange={setPressing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {dialog?.type === 'result' && (
        <ResultDialog
          result={dialog.result}
          onExit={() => navigate('/')}
          onRestart={() => {
            closeDialog()
            ms.restart()
          }}
          onPlayAgain={() => {
            closeDialog()
            startNewGame()
          }}
        />
      )}

      {dialog?.type === 'inProgress' && (
        <InProgressDialog
          onQuit={() => {
            record(false, ms.time)
            closeDialog()
            dialog.action()
          }}
          onRestart={() => {
            record(false, ms.time)
            closeDialog()
            ms.restart()
          }}
          onKeepPlaying={closeDialog}
        />
      )}

      {dialog?.type === 'statistics' && (
        <StatisticsDialog
          stats={stats}
          initialDifficulty={isRanked(gameDifficulty) ? gameDifficulty : 'beginner'}
          onChange={setStats}
          onClose={closeDialog}
        />
      )}

      {dialog?.type === 'options' && (
        <OptionsDialog
          settings={settings}
          onClose={closeDialog}
          onSave={(next) => {
            closeDialog()
            changeSettings(next)
          }}
        />
      )}

      {dialog?.type === 'help' && <HelpDialog onClose={closeDialog} />}
    </div>
  )
}
