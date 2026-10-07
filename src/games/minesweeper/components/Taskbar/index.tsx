import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MineIcon } from '../Icons'
import classes from './index.module.css'

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export function Taskbar() {
  const { t } = useTranslation()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={classes.taskbar} aria-hidden="true">
      <span className={classes.start}>start</span>
      <span className={classes.task}>
        <span className={classes.taskIcon}>
          <MineIcon />
        </span>
        {t('minesweeper.title')}
      </span>
      <span className={classes.tray}>{formatTime(now)}</span>
    </div>
  )
}
