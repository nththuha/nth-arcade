import { STORAGE_KEYS, loadNumber } from '@/shared/storage'
import type { TFunction } from 'i18next'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import Preview2048 from './2048/components/Preview'
import PreviewFlappy from './flappy-bird/components/Preview'
import PreviewMinesweeper from './minesweeper/components/Preview'
import { loadSettings } from './minesweeper/hooks/useSettings'
import { loadStats } from './minesweeper/hooks/useStats'
import PreviewSnake from './snake/components/Preview'

export interface GameEntry {
  id: '2048' | 'snake' | 'minesweeper' | 'flappy_bird'
  path: string
  loadBest: (t: TFunction) => string
  accent: string
  Preview: ComponentType
  Component: LazyExoticComponent<ComponentType>
}

export const GAMES: GameEntry[] = [
  {
    id: '2048',
    path: '/2048',
    loadBest: () => String(loadNumber(STORAGE_KEYS.BEST_2048)),
    accent: 'var(--color-accent-2048)',
    Preview: Preview2048,
    Component: lazy(() => import('./2048')),
  },
  {
    id: 'snake',
    path: '/snake',
    loadBest: () => String(loadNumber(STORAGE_KEYS.BEST_SNAKE)),
    accent: 'var(--color-accent-snake)',
    Preview: PreviewSnake,
    Component: lazy(() => import('./snake')),
  },
  {
    id: 'minesweeper',
    path: '/minesweeper',
    loadBest: (t) => {
      const { difficulty } = loadSettings()
      const level = difficulty === 'custom' ? 'beginner' : difficulty
      const best = loadStats()[level].bestTimes[0]?.time
      return best === undefined ? '—' : t('dashboard.seconds', { value: best })
    },
    accent: 'var(--color-accent-minesweeper)',
    Preview: PreviewMinesweeper,
    Component: lazy(() => import('./minesweeper')),
  },
  {
    id: 'flappy_bird',
    path: '/flappy-bird',
    loadBest: () => String(loadNumber(STORAGE_KEYS.BEST_FLAPPY)),
    accent: 'var(--color-accent-flappy)',
    Preview: PreviewFlappy,
    Component: lazy(() => import('./flappy-bird')),
  },
]
