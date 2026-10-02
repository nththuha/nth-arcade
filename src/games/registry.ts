import { STORAGE_KEYS } from '@/shared/storage'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import Preview2048 from './2048/components/Preview'
import PreviewSnake from './snake/components/Preview'

export interface GameEntry {
  id: '2048' | 'snake'
  path: string
  bestScoreKey: string
  accent: string
  Preview: ComponentType
  Component: LazyExoticComponent<ComponentType>
}

export const GAMES: GameEntry[] = [
  {
    id: '2048',
    path: '/2048',
    bestScoreKey: STORAGE_KEYS.BEST_2048,
    accent: 'var(--color-accent-2048)',
    Preview: Preview2048,
    Component: lazy(() => import('./2048')),
  },
  {
    id: 'snake',
    path: '/snake',
    bestScoreKey: STORAGE_KEYS.BEST_SNAKE,
    accent: 'var(--color-accent-snake)',
    Preview: PreviewSnake,
    Component: lazy(() => import('./snake')),
  },
]
