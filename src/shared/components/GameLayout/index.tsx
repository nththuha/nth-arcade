import type { ReactNode } from 'react'
import { GameNav } from '../GameNav'
import classes from './index.module.css'

type GameLayoutProps = {
  className?: string
  decor?: ReactNode
  children: ReactNode
}

export function GameLayout({ className, decor, children }: GameLayoutProps) {
  return (
    <div className={`${classes.layout} ${className ?? ''}`}>
      {decor}
      <GameNav className={classes.nav} />
      <main className={classes.main}>{children}</main>
    </div>
  )
}
